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

    var iterationsD = Math.ceil( ( destination.length - offsetD ) / paddingD );
    var iterationsS = Math.ceil( ( source.length - offsetS ) / paddingS );
    var iterations = Math.min( iterationsD, iterationsS );

    while ( iterations -- ) {
        destination[ offsetD ] = map( source, offsetS );
        offsetD += paddingD;
        offsetS += paddingS;
    }

};

var setArray = function ( destination, value, offset, padding ) {

    if ( typeof offset === 'undefined' )  offset = 0;
    if ( typeof padding === 'undefined' ) padding = 1;

    var iterations = Math.ceil( ( destination.length - offset ) / padding );

    while ( iterations -- ) {
        destination[ offset ] = value;
        offset += padding;
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

    this.groups = { };
    this.lights = { };
    this.entities = { };

    this.all = { };

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
        .children( 'LIMD' )
        .children( 'LMAP' ) );

    this._loadXtraBrushes( root
        .children( 'RTWF' )
        .children( 'XTRA' )
        .children( 'BGEO' )
        .children( 'BRSH' ) );

    debug.flags.compiling && debug.groupEnd( );

    debug.flags.compiling && debug.group( "Compilation phase" );

    this._traverseEchi( this, root
        .children( 'RTWF' )
        .children( 'WRLD' )
        .children( 'ECHI' ) );

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

exports.ThreeEntity.prototype._apply8bData = function ( destination, source, useFloats ) {

    var map = useFloats ? function ( source, offset ) { return source[ offset ] / 0xFF; } : undefined;

    source = new Uint8Array( source );

    copyArray( destination, source, 0, 4, 0, 3, map );
    copyArray( destination, source, 1, 4, 1, 3, map );
    copyArray( destination, source, 2, 4, 2, 3, map );
    setArray( destination, useFloats ? 1.0 : 0xFF, 3, 4 );

};

exports.ThreeEntity.prototype._apply8baData = function ( destination, source, useFloats ) {

    var map = useFloats ? function ( source, offset ) { return source[ offset ] / 0xFF; } : undefined;

    source = new Uint8Array( source );

    copyArray( destination, source, 0, 4, map );
    copyArray( destination, source, 1, 4, map );
    copyArray( destination, source, 2, 4, map );
    copyArray( destination, source, 3, 4, map );

};

exports.ThreeEntity.prototype._apply8bmData = function ( destination, source, useFloats ) {

    var map = useFloats ? function ( source, offset ) { return source[ offset ] / 0xFF; } : undefined;

    source = new Uint8Array( source );

    copyArray( destination, source, 0, 4, 0, 1, map );
    copyArray( destination, source, 1, 4, 0, 1, map );
    copyArray( destination, source, 2, 4, 0, 1, map );
    setArray( destination, useFloats ? 1.0 : 0xFF, 3, 4 );

};

exports.ThreeEntity.prototype._apply16bffData = function ( destination, source, useFloats ) {

    var merge = function ( source, offset ) { return source[ offset ] | ( source[ offset + 1 ] << 8 ); };
    var map = useFloats ? function ( source, offset ) { return merge( source, offset ) / 0xFFFF; } : merge;

    source = new Uint8Array( source );
    copyArray( destination, source, 0, 4, 0, 6, map );
    copyArray( destination, source, 1, 4, 2, 6, map );
    copyArray( destination, source, 2, 4, 4, 6, map );
    setArray( destination, useFloats ? 1.0 : 0xFF, 3, 4 );

};

exports.ThreeEntity.prototype._apply32bfData = function ( destination, source, useFloats ) {

    var map = useFloats ? undefined : function ( source, offset ) { return Math.floor( source[ offset ] * 0xFF ); };

    source = new Float32Array( source );

    copyArray( destination, source, 0, 4, 0, 3, map );
    copyArray( destination, source, 1, 4, 1, 3, map );
    copyArray( destination, source, 2, 4, 2, 3, map );
    setArray( destination, useFloats ? 1.0 : 0xFF, 3, 4 );

};

exports.ThreeEntity.prototype._applyData = function ( destination, source, format, useFloats ) {
    switch ( format ) {
        case exports.ThreeEntity.FORMAT_8B:
            this._apply8bData( destination, source, useFloats );
        break;
        case exports.ThreeEntity.FORMAT_8BA:
            this._apply8baData( destination, source, useFloats );
        break;
        case exports.ThreeEntity.FORMAT_8BM:
            this._apply8bmData( destination, source, useFloats );
        break;
        case exports.ThreeEntity.FORMAT_16BFF:
            this._apply16bffData( destination, source, useFloats );
        break;
        case exports.ThreeEntity.FORMAT_32BF:
            this._apply32bfData( destination, source, useFloats );
        break;
    }
};

exports.ThreeEntity.prototype._createTexture = function ( data, width, height, format, useFloats ) {

    var filteredType = useFloats ? Float32Array : Uint8Array;
    var filteredData = new filteredType( width * height * 4 );

    this._applyData( filteredData, data, format, useFloats );

    var texture = new THREE.DataTexture( filteredData, width, height );

    texture.format = THREE.RGBAFormat;
    texture.type = useFloats ? THREE.FloatType : THREE.UnsignedByteType;

    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    texture.generateMipmaps = false;

    return texture;

};

exports.ThreeEntity.prototype._createImage = function ( data, width, height, format ) {

    var canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( '2d' );

    canvas.width = width;
    canvas.height = height;

    var destination = context.createImageData( canvas.width, canvas.height );

    var x = this._createTexture( data, width, height, format, false ).image.data;
    destination.data.set( x );
    context.putImageData( destination, 0, 0 );

    console.log( destination.data );

    return canvas;

};

exports.ThreeEntity.prototype._loadXtraTextures = function ( textureNodes ) {

    textureNodes.forEach( function ( textureNode ) {

        var texn = textureNode.content( 'TEXN' );
        var width = textureNode.content( 'TWID' );
        var height = textureNode.content( 'THEI' );
        var format = textureNode.content( 'PFMT' );
        var data = textureNode.content( 'DATA' );

        if ( debug.flags.compiling && debug.flags.textures )
            debug.notice( "Extracting data from texture \"" + texn + "\" (" + width + "x" + height + ")" );

        var texture = this._textures[ texn ] = this._createTexture( data, width, height, {
            0 : exports.ThreeEntity.FORMAT_8BA
        }[ format ], false );

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        texture.needsUpdate = true;

    }, this );

};

exports.ThreeEntity.prototype._loadXtraLightmaps = function ( lightmapNodes ) {

    lightmapNodes.forEach( function ( lightmapNode ) {

        var lmid = lightmapNode.content( 'LMID' );
        var width = lightmapNode.content( 'LWID' );
        var height = lightmapNode.content( 'LHEI' );
        var format = lightmapNode.content( 'LFMT' );
        var data = lightmapNode.content( 'DATA' );

        if ( debug.flags.compiling && debug.flags.lightmaps )
            debug.notice( "Extracting data from lightmap #" + lmid + " (" + width + "x" + height + ")" );

        var texture = this._lightmaps[ lmid ] = this._createTexture( data, width, height, {
            0 : exports.ThreeEntity.FORMAT_8B,
            1 : exports.ThreeEntity.FORMAT_16BFF,
            2 : exports.ThreeEntity.FORMAT_32BF,
            3 : exports.ThreeEntity.FORMAT_8BM
        }[ format ], true );

        console.log( texture.image.data );

        texture.needsUpdate = true;

    }, this );

};

exports.ThreeEntity.prototype._loadXtraBrushes = function ( brushNodes ) {

    var brushes = this._rawBrushes = { };

    brushNodes.forEach( function ( brushNode ) {

        var ifid = brushNode.content( 'IFID' );
        var brush0Entry = brushes[ ifid ] = { };

        if ( debug.flags.compiling && debug.flags.brushes )
            debug.notice( 'Extracting geometry from brush #' + ifid );

        brushNodes.children( 'FACE' ).forEach( function ( faceNode ) {

            var texn = faceNode.content( 'TEXN' );
            var brush1Entry = brush0Entry[ texn ] = ( brush0Entry[ texn ] || { } );

            faceNode.children( 'SUBF' ).forEach( function ( subfNode ) {

                var lmid = subfNode.content( 'LMID' ) || '';
                var brush2Entry = brush1Entry[ lmid ] = ( brush1Entry[ lmid ] || [ ] );

                triangulate( subfNode.children( 'VERT' ) ).forEach( function ( triangle ) {
                    brush2Entry.push( triangle );
                } );

            } );

        } );

    } );

};

exports.ThreeEntity.prototype._traverseEchi = function ( element, echiNode ) {

    this._compileBrushes( element, echiNode.children( 'BRSH' ) );

    this._initLights( element, echiNode.children( 'PLGT' ) );

    this._registerUserEntities( element, echiNode.children( 'UENT' ) );

    echiNode.children( 'AENT' ).forEach( function ( aentNode ) {

        var newElement = new THREE.Object3( );

        if ( aentNode.has( 'ENAM' ) ) {
            var name = aentNode.content( 'ENAM' );
            this.groups[ name ] = newElement;
            this.all[ name ] = newElement;
        }

        element.add( newElement );

        this._traverseEchi( newElement, aentNode.children( 'ECHI' ) );

    }, this );

};

exports.ThreeEntity.prototype._compileBrushes = function ( element, brushNodes ) {

    brushNodes.forEach( function ( brushNode ) {
        var ifid = brushNode.content( 'IFID' );
        var rawBrush = this._rawBrushes[ ifid ];

        if ( debug.flags.compiling )
            debug.assert( rawBrush, "Raw brush data wasn't found in file. Did you forget to save extra data (BGEO chunk) ?" );

        if ( ! rawBrush )
            return ;

        Object.keys( rawBrush ).forEach( function ( texn ) {
            Object.keys( rawBrush[ texn ] ).forEach( function ( lmid, index ) {

                var texture = this._textures[ texn ];
                var lightmap = this._lightmaps[ lmid ];

                if ( debug.compiling )
                    debug.assert( texture, "Raw texture data hadn't been found in file. Did you forget to save extra data (TEXD chunk) ?" );

                if ( debug.compiling )
                    debug.assert( lightmap, "Raw lightmap data hadn't been found in file. Did you forget to save extra data (LIMD chunk) ?" );

                if ( ! texture )
                    return ;

                var materialData = { map : texture };
                if ( lightmap ) materialData.lightMap = lightmap;

                var geometry = this._compileGeometry( rawBrush[ texn ][ lmid ] );
                var material = new THREE.MeshPhongMaterial( materialData );

                if ( debug.flags.compiling )
                    debug.notice( "One more mesh in the world bucket" );

                var mesh = new THREE.Mesh( geometry, material );

                element.add( mesh );

            }, this );
        }, this );
    }, this );

};

exports.ThreeEntity.prototype._compileGeometry = function ( triangles ) {

    var triangleCount = triangles.length;

    var attributes = {
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
            numItems : triangleCount * 3 * 2 },
        uv2 : {
            itemSize : 2,
            array : new Float32Array( triangleCount * 3 * 2 ),
            numItems : triangleCount * 3 * 2 } };

    triangles.forEach( function ( vertices, triangleIndex ) {
        vertices.forEach( function ( vertexNode, vertexIndex ) {

            var firstOffset = function ( attribute ) {
                return ( triangleIndex * 3 + vertexIndex ) * attribute.itemSize; };

            var vertexData = vertexNode.content( );

            var indexOffset = firstOffset( attributes.index );
            attributes.index.array[ indexOffset ] = indexOffset;

            var positionOffset = firstOffset( attributes.position );
            attributes.position.array[ positionOffset + 0 ] = vertexData.x;
            attributes.position.array[ positionOffset + 1 ] = vertexData.y;
            attributes.position.array[ positionOffset + 2 ] = vertexData.z;

            var normalOffset = firstOffset( attributes.normal );
            attributes.normal.array[ normalOffset + 0 ] = vertexData.nx;
            attributes.normal.array[ normalOffset + 1 ] = vertexData.ny;
            attributes.normal.array[ normalOffset + 2 ] = vertexData.nz;

            var uvOffset = firstOffset( attributes.uv );
            attributes.uv.array[ uvOffset + 0 ] = vertexData.st;
            attributes.uv.array[ uvOffset + 1 ] = vertexData.tt;

            var uv2Offset = firstOffset( attributes.uv2 );
            attributes.uv2.array[ uv2Offset + 0 ] = vertexData.sl;
            attributes.uv2.array[ uv2Offset + 1 ] = vertexData.tl;

        } );
    } );

    var geometry = new THREE.BufferGeometry( );

    Object.keys( attributes ).forEach( function ( name ) {

        var attribute = attributes[ name ];
        var bufferAttribute = new THREE.BufferAttribute( attribute.array, attribute.itemSize );

        if ( name === 'index' ) {
            geometry.setIndex( bufferAttribute );
        } else {
            geometry.addAttribute( name, bufferAttribute );
        }

    } );

    geometry.groups = [ {
        start : 0,
        count : triangleCount * 3,
        index : 0
    } ];

    geometry.computeBoundingSphere( );

    return geometry;

};

exports.ThreeEntity.prototype._initLights = function ( element, lightNodes ) {

    lightNodes.forEach( function ( lightNode ) {

        var light = new THREE.PointLight( );

        if ( lightNode.has( 'ENAM' ) ) {
            var name = lightNode.content( 'ENAM' );
            this.lights[ name ] = light;
            this.all[ name ] = light;
        }

        light.visible = false;

        light.position.x = lightNode.content( 'POSX' );
        light.position.y = lightNode.content( 'POSY' );
        light.position.z = lightNode.content( 'POSZ' );

        light.color.r = lightNode.content( 'COLR' );
        light.color.g = lightNode.content( 'COLG' );
        light.color.b = lightNode.content( 'COLB' );

        light.intensity = lightNode.content( 'LMUL' );
        light.distance = lightNode.content( 'RADI' );

        element.add( light );

        if ( debug.flags.compiling )
            debug.notice( "One more light in the world bucket" );

    }, this );

};

exports.ThreeEntity.prototype._registerUserEntities = function ( element, uentNodes ) {

    uentNodes.forEach( function ( uentNode ) {

        var entity = new THREE.Object3D( );

        if ( uentNode.has( 'ENAM' ) ) {
            var name = uentNode.content( 'ENAM' );
            this.entities[ name ] = entity;
            this.all[ name ] = entity;
        }

        entity.position.x = uentNode.content( 'POSX' );
        entity.position.y = uentNode.content( 'POSY' );
        entity.position.z = uentNode.content( 'POSZ' );

        element.add( entity );

        if ( debug.flags.compiling )
            debug.notice( "One more entity in the world bucket" );

    }, this );

};
