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

            if ( debug.flags.loading )
                debug.warning( 'Unrecognized ' + label + ' chunk -- ignored' );

            continue ;

        }

        if ( dict[ label ] && dict[ label ].constructor === Object ) {

            if ( debug.flags.loading )
                debug.group( label + ' chunk', true );

            var subDataView = new DataView( dataView.buffer, dataView.byteOffset + pointer + 8, dataView.byteLength - pointer - 8 );
            chunk.children = readChunks( stack.concat( [ label ] ), dict[ label ], subDataView );

            if ( debug.flags.loading )
                debug.groupEnd( );

        } else if (dict[ label ] && dict[ label ].constructor === String ) {

            chunk.content = parsers[ dict[ label ] ]( dataView, pointer + 8, size );

            if ( debug.flags.loading )
                debug.notice( 'Parsing ' + label + ' chunk using ' + dict[ label ] + ' strategy (gives ' + chunk.content + ')' );

        } else {

            chunk.content = dataView.buffer.slice( dataView.byteOffset + pointer + 8, dataView.byteOffset + pointer + 8 + size );

            if ( debug.flags.loading )
                debug.notice( 'Registering ' + label + ' chunk as data buffer' );

        }

        chunks.push( chunk );
    }

    return chunks;

};

exports.loadBuffer = function ( buffer ) {

    return new Promise( function ( resolve, reject ) {

        if ( debug.flags.loading )
            debug.group( "World file loading", true );

        var dataView = new DataView( buffer, 0, buffer.byteLength );
        var chunks = readChunks( [ ], dictionaries.ROOT, dataView );

        if ( debug.flags.loading )
            debug.groupEnd( );

        resolve( new tree.Node( { children : chunks } ) );

    } );

};

exports.loadUrl = function ( url ) {

    return new Promise( function ( resolve, reject ) {

        var xhr = new XMLHttpRequest( );

        xhr.open( 'GET', url, true );
        xhr.responseType = 'arraybuffer';

        xhr.addEventListener( 'load', function ( event ) {

            exports.loadBuffer( xhr.response ).then( function ( success ) {
                resolve( success );
            }, function ( error ) {
                reject( error );
            } );

        } );

        xhr.send( null );

    } );

};
