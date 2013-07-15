var debug = require( './debug' );

var triangulate = function ( verticeNodes ) {
    var vertices = [ ];

    for ( var t = 2, T = verticeNodes.count( ); t < T; ++ t )
        vertices.push( [ verticeNodes.at( 0 ), verticeNodes.at( t - 1 ), verticeNodes.at( t ) ] );

    return vertices;
};

var copyArray = function ( destination, source, offsetD, paddingD, offsetS, paddingS, map ) {
    if ( typeof offsetD === 'undefined' )  offsetD = 0;
    if ( typeof paddingD === 'undefined' ) paddingD = 1;
    if ( typeof offsetS === 'undefined' )  offsetS = offsetD;
    if ( typeof paddingS === 'undefined' ) paddingS = paddingD;
    if ( typeof map === 'undefined' )      map = function ( source, offset ) { return source[ offset ]; };

    var iterationsD = Math.floor( ( destination.length - offsetD ) / paddingD );
    var iterationsS = Math.floor( ( source.length - offsetS ) / paddingS );
    var iterations = Math.min( iterationsD, iterationsS );

    while ( iterations -- ) {
        destination[ offsetD ] = map( source, offsetS );
        offsetD += paddingD;
        offsetS += paddingS;
    }
};

var Parent = typeof THREE === 'undefined'
    ? function ( ) { throw new Error( 'Three.js must be loaded before RTWorldReader in order to use RTWorldReader.ThreeEntity' ); }
    : THREE.Object3D;

exports.ThreeEntity = function ( root ) {

    Parent.call( this );

    this._textures = { };
    this._lightmaps = [ ];
    this._rawBrushes = { };

    debug.flags.compiling && debug.group( "World generation (Three.js entity)" );

    debug.flags.compiling && debug.group( "Extra data extraction phase", true );

    this._loadXtraTextures( root
        .children( 'RTWF' )
        .children( 'XTRA' )
        .children( 'TEXD' )
        .children( 'TXTR' ) );

    this._loadXtraLightmaps( root
        .children( 'RTWF' )
        .children( 'XTRA' )
        .children( 'LIMD' ) );

    this._loadXtraBrushes( root
        .children( 'RTWF' )
        .children( 'XTRA' )
        .children( 'BGEO' )
        .children( 'BRSH' ) );

    debug.flags.compiling && debug.groupEnd( );

    debug.flags.compiling && debug.group( "Compilation phase" );

    this._compileBrushes( root
        .children( 'RTWF' )
        .children( 'WRLD' )
        .children( 'ECHI' )
        .children( 'BRSH' ) );

    debug.flags.compiling && debug.groupEnd( );

    debug.flags.compiling && debug.groupEnd( );

};

exports.ThreeEntity.FORMAT_8B = 0;
exports.ThreeEntity.FORMAT_8BA = 1;
exports.ThreeEntity.FORMAT_8BM = 2;
exports.ThreeEntity.FORMAT_16BFF = 3;
exports.ThreeEntity.FORMAT_32BF = 4;

var F = function ( ) { };
F.prototype = Parent.prototype;
exports.ThreeEntity.prototype = new F( );

exports.ThreeEntity.prototype._apply8bSource = function ( destination, source ) {
    source = new Int8Array( source );
    copyArray( destination, source, 0, 4, 0, 3 );
    copyArray( destination, source, 1, 4, 1, 3 );
    copyArray( destination, source, 2, 4, 2, 3 );
};

exports.ThreeEntity.prototype._apply8baData = function ( destination, source ) {
    var inverse = function ( source, offset ) { return 255 - source[ offset ]; };
    source = new Int8Array( source );
    copyArray( destination, source, 0, 4 );
    copyArray( destination, source, 1, 4 );
    copyArray( destination, source, 2, 4 );
    copyArray( destination, source, 3, 4, 3, 4, inverse );
};

exports.ThreeEntity.prototype._apply8bmSource = function ( destination, source ) {
    source = new Int8Array( source );
    copyArray( destination, source, 0, 4, 0, 1 );
    copyArray( destination, source, 1, 4, 0, 1 );
    copyArray( destination, source, 2, 4, 0, 1 );
};

exports.ThreeEntity.prototype._apply16bffData = function ( destination, source ) {
    var unfix = function ( source, offset ) { return ( source[ offset ] | ( source[ offset + 1 ] << 8 ) ) / 256; };
    source = new Uint8Array( source );
    copyArray( destination, source, 0, 4, 0, 6, unfix );
    copyArray( destination, source, 1, 4, 2, 6, unfix );
    copyArray( destination, source, 2, 4, 4, 6, unfix );
};

exports.ThreeEntity.prototype._apply32bfData = function ( destination, source ) {
    source = new Float32Array( source );
    copyArray( destination, source, 0, 4, 0, 3 );
    copyArray( destination, source, 1, 4, 1, 3 );
    copyArray( destination, source, 2, 4, 2, 3 );
};

exports.ThreeEntity.prototype._applyData = function ( destination, format, source ) {
    switch ( format ) {
        case exports.ThreeEntity.FORMAT_8B:
            this._apply8bData( destination, source );
        break;
        case exports.ThreeEntity.FORMAT_8BA:
            this._apply8baData( destination, source );
        break;
        case exports.ThreeEntity.FORMAT_8BM:
            this._apply8bmData( destination, source );
        break;
        case exports.ThreeEntity.FORMAT_16BFF:
            this._apply16bffData( destination, source );
        break;
        case exports.ThreeEntity.FORMAT_32BF:
            this._apply32bfData( destination, source );
        break;
    }
};

exports.ThreeEntity.prototype._createImage = function ( width, height, format, data ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = width; canvas.height = height;

    var context = canvas.getContext( '2d' );

    var destination = context.createImageData( canvas.width, canvas.height );
    this._applyData( destination.data, format, data );
    context.putImageData( destination, 0, 0 );

    document.body.appendChild( canvas );

    return canvas;

};

exports.ThreeEntity.prototype._loadXtraTextures = function ( textureNodes ) {

    textureNodes.forEach( function ( textureNode ) {

        var texn = textureNode.children( 'TEXN' ).prop( 'content' );
        var width = textureNode.children( 'TWID' ).prop( 'content' );
        var height = textureNode.children( 'THEI' ).prop( 'content' );
        var format = textureNode.children( 'PFMT' ).prop( 'content' );
        var data = textureNode.children( 'DATA' ).prop( 'content' );

        if ( debug.flags.compiling && debug.flags.textures )
            debug.notice( "Extracting data from texture \"" + texn + "\" (" + width + "x" + height + ")" );

        var texture = this._textures[ texn ] = new THREE.Texture( this._createImage( width, height, {
            0 : exports.ThreeEntity.FORMAT_8BA
        }[ format ], data ) );

        texture.needsUpdate = true;

    }, this );

};

exports.ThreeEntity.prototype._loadXtraLightmaps = function ( lightmapNodes ) {

    lightmapNodes.forEach( function ( lightmapNode ) {

        var lmid = lightmapNode.children( 'LMID' ).prop( 'content' );
        var width = lightmapNode.children( 'LWID' ).prop( 'content' );
        var height = lightmapNode.children( 'LHEI' ).prop( 'content' );
        var format = lightmapNode.children( 'LFMT' ).prop( 'content' );
        var data = lightmapNode.children( 'DATA' ).prop( 'content' );

        if ( debug.flags.compiling && debug.flags.lightmaps )
            debug.notice( "Extracting data from texture #" + lmid + " (" + width + "x" + height + ")" );

        var texture = this._lightmaps[ lmid ] = new THREE.Texture( this._createImage( width, height, {
            0 : exports.ThreeEntity.FORMAT_8B,
            1 : exports.ThreeEntity.FORMAT_16BFF,
            2 : exports.ThreeEntity.FORMAT_32BF,
            3 : exports.ThreeEntity.FORMAT_8BM
        }[ format ], data ) );

        texture.needsUpdate = true;

    } );

};

exports.ThreeEntity.prototype._loadXtraBrushes = function ( brushNodes ) {

    var brushes = this._rawBrushes = { };

    brushNodes.forEach( function ( brushNode ) {

        var ifid = brushNode.children( 'IFID' ).prop( 'content' );
        var brush0Entry = brushes[ ifid ] = { };

        if ( debug.flags.compiling && debug.flags.brushes )
            debug.notice( 'Extracting geometry from brush #' + ifid );

        brushNodes.children( 'FACE' ).forEach( function ( faceNode ) {

            var texn = faceNode.children( 'TEXN' ).prop( 'content' );
            var brush1Entry = brush0Entry[ texn ] = ( brush0Entry[ texn ] || { } );

            faceNode.children( 'SUBF' ).forEach( function ( subfNode ) {

                var lmid = faceNode.children( 'LMID' ).prop( 'content' ) || '';
                var brush2Entry = brush1Entry[ lmid ] = ( brush1Entry[ lmid ] || [ ] );

                triangulate( subfNode.children( 'VERT' ) ).forEach( function ( triangle ) {
                    brush2Entry.push( triangle );
                } );

            } );

        } );

    } );

};

exports.ThreeEntity.prototype._compileBrushes = function ( brushNodes ) {

    brushNodes.forEach( function ( brushNode ) {
        var ifid = brushNode.children( 'IFID' ).prop( 'content' );
        var rawBrush = this._rawBrushes[ ifid ];

        if ( debug.flags.compiling )
            debug.assert( rawBrush, "Raw brush data wasn't found in file. Did you forget to save extra data (BGEO chunk) ?" );

        if ( ! rawBrush )
            return ;

        Object.keys( rawBrush ).forEach( function ( texn ) {
            Object.keys( rawBrush[ texn ] ).forEach( function ( lmid ) {
                var texture = this._textures[ texn ];
                var lightmap = this._lightmaps[ lmid ];

                if ( debug.compiling )
                    debug.assert( texture, "Raw texture data hadn't been found in file. Did you forget to save extra data (TEXD chunk) ?" );

                if ( debug.compiling )
                    debug.assert( lightmap, "Raw lightmap data hadn't been found in file. Did you forget to save extra data (LIMD chunk) ?" );

                if ( ! texture )
                    return ;

                var materialData = { map : texture };
                if ( lightmap ) materialData.lightmap = lightmap;

                var geometry = this._compileGeometry( rawBrush[ texn ][ lmid ] );
                var material = new THREE.MeshLambertMaterial( materialData );

                if ( debug.flags.compiling )
                    debug.notice( "One more mesh in the world bucket" );

                this.add( new THREE.Mesh( geometry, material ) );
            }, this );
        }, this );
    }, this );

};

exports.ThreeEntity.prototype._compileGeometry = function ( triangles ) {

    var triangleCount = triangles.length;

    var geometry = new THREE.BufferGeometry( );
    geometry.attributes = {
        index : {
            itemSize : 1,
            array : new Uint16Array( triangleCount * 3 ),
            numItems : triangleCount * 3 },
        position : {
            itemSize : 3,
            array : new Float32Array( triangleCount * 3 * 3 ),
            numItems : triangleCount * 3 * 3 },
        normal : {
            itemSize : 3,
            array : new Float32Array( triangleCount * 3 * 3 ),
            numItems : triangleCount * 3 * 3 },
        uv : {
            itemSize : 2,
            array : new Float32Array( triangleCount * 3 * 2 ),
            numItems : triangleCount * 3 * 2 } };

    triangles.forEach( function ( vertices, triangleIndex ) {
        vertices.forEach( function ( vertexNode, vertexIndex ) {
            var firstOffset = function ( attribute ) {
                return ( triangleIndex * 3 + vertexIndex ) * attribute.itemSize; };

            var vertexData = vertexNode.prop( 'content' );

            var indexOffset = firstOffset( geometry.attributes.index );
            geometry.attributes.index.array[ indexOffset ] = indexOffset;

            var positionOffset = firstOffset( geometry.attributes.position );
            geometry.attributes.position.array[ positionOffset + 0 ] = vertexData.x;
            geometry.attributes.position.array[ positionOffset + 1 ] = vertexData.y;
            geometry.attributes.position.array[ positionOffset + 2 ] = vertexData.z;

            var normalOffset = firstOffset( geometry.attributes.normal );
            geometry.attributes.normal.array[ normalOffset + 0 ] = vertexData.nx;
            geometry.attributes.normal.array[ normalOffset + 1 ] = vertexData.ny;
            geometry.attributes.normal.array[ normalOffset + 2 ] = vertexData.nz;

            var uvOffset = firstOffset( geometry.attributes.uv );
            var normalize = function ( n ) { n = n % 1; return n < 0 ? 1 + n : n; };
            geometry.attributes.uv.array[ uvOffset + 0 ] = normalize( vertexData.st );
            geometry.attributes.uv.array[ uvOffset + 1 ] = normalize( vertexData.tt );
        } );
    } );

    geometry.offsets = [ {
        start : 0,
        count : triangleCount * 3,
        index : 0
    } ];

    geometry.computeBoundingSphere( );

    return geometry;

};
