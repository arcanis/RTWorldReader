var debug = require( './debug' );
var dictionaries = require( './dictionaries' );
var parsers = require( './parsers' );
var tree = require( './tree' );

var stringify = function ( int32 ) {
    return String.fromCharCode( ( int32 >>  0 ) & 0xFF )
        + String.fromCharCode( ( int32 >>  8 ) & 0xFF )
        + String.fromCharCode( ( int32 >> 16 ) & 0xFF )
        + String.fromCharCode( ( int32 >> 24 ) & 0xFF ); };

var readChunks = function ( stack, dict, dataView ) {
    var chunks = [ ], lastChunk;

    for ( var pointer = 0; pointer < dataView.byteLength; pointer += lastChunk.fullSize ) {
        var id = dataView.getUint32( pointer, true );
        var label = stringify( id );
        if ( id === 0 ) break ;

        var size = dataView.getInt32( pointer + 4, true );
        var chunk = lastChunk = { id : id, label : label, size : size, fullSize : size + 8, content : null };

        if ( ! dict.hasOwnProperty( label ) ) {
            debug.warning( stack, 'Unrecognized label ' + label );
            continue ;
        }

        if ( dict[ label ] && dict[ label ].constructor === Object ) {
            debug.notice( stack, 'Entering label ' + label );
            var subDataView = new DataView( dataView.buffer, dataView.byteOffset + pointer + 8, dataView.byteLength - pointer - 8 );
            chunk.children = readChunks( stack.concat( [ label ] ), dict[ label ], subDataView );
            debug.notice( stack, 'Leaving label ' + label );
        } else if (dict[ label ] && dict[ label ].constructor === String ) {
            chunk.content = parsers[ dict[ label ] ]( dataView, pointer + 8, size );
            debug.notice( stack, 'Parsing ' + label + ' using ' + dict[ label ] + ' strategy (gives ' + chunk.content + ')' );
        } else {
            debug.notice( stack, 'Registering ' + label + ' data' );
            chunk.content = new DataView( dataView.buffer, dataView.byteOffset + pointer + 8, size );
        }

        chunks.push( chunk );
    }

    return chunks;
};

exports.loadBuffer = function ( buffer, callback ) {

    var dataView = new DataView( buffer, 0, buffer.byteLength );
    var chunks = readChunks( [ ], dictionaries.ROOT, dataView );

    callback( null, new tree.Node( { children : chunks } ) );

};

exports.loadUrl = function ( url, callback ) {

    var xhr = new XMLHttpRequest( );
    xhr.open( 'GET', url, true );

    xhr.responseType = 'arraybuffer';
    xhr.onload = function ( event ) {
        exports.loadBuffer( xhr.response, callback );
    };

    xhr.send( null );

};
