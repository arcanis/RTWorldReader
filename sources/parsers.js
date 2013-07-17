exports.signed = function ( dataView, offset, length ) {
    return dataView[ 'getInt' + ( length * 8 ) ]( offset, true );
};

exports.unsigned = function ( dataView, offset, length ) {
    return dataView[ 'getUint' + ( length * 8 ) ]( offset, true );
};

exports.float = function ( dataView, offset, length ) {
    return dataView[ 'getFloat' + ( length * 8 ) ]( offset, true );
};

exports.boolean = function ( dataView, offset, length ) {
    return dataView.getUint8( offset ) !== 0;
};

exports.string = function ( dataView, offset, length ) {
    var strlen = dataView.getUint32( offset, true );

    var utf16 = new ArrayBuffer( strlen * 2 );
    var utf16View = new Uint16Array( utf16 );

    for ( var i = 0; i < strlen; ++ i )
        utf16View[ i ] = dataView.getUint8( offset + 4 + i );

    return String.fromCharCode.apply( String, utf16View );
};

exports.vertice = function ( dataView, offset, length ) {
    var vertice = { };

    vertice.x = dataView.getFloat64( offset, true ); offset += 8;
    vertice.y = dataView.getFloat64( offset, true ); offset += 8;
    vertice.z = dataView.getFloat64( offset, true ); offset += 8;
    vertice.nx = dataView.getFloat64( offset, true ); offset += 8;
    vertice.ny = dataView.getFloat64( offset, true ); offset += 8;
    vertice.nz = dataView.getFloat64( offset, true ); offset += 8;
    vertice.st = dataView.getFloat64( offset, true ); offset += 8;
    vertice.tt = dataView.getFloat64( offset, true ); offset += 8;
    vertice.r = dataView.getFloat64( offset, true ); offset += 8;
    vertice.g = dataView.getFloat64( offset, true ); offset += 8;
    vertice.b = dataView.getFloat64( offset, true ); offset += 8;
    vertice.sl = offset < length ? dataView.getFloat64( offset, true ) : null; offset += 8;
    vertice.tl = offset < length ? dataView.getFloat64( offset, true ) : null; offset += 8;

    vertice.toString = function ( ) { return JSON.stringify( this ); };
    return vertice;
};
