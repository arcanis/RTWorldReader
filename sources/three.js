var triangulize = function ( verticeNodes ) {
    switch ( verticeNodes.count( ) ) {
        case 3: return [ verticeNodes ];
        case 4: return [ verticeNodes.slice( 0, 3 ), verticeNodes.slice( 2, 4 ).prepend( verticeNodes.at( 0 ) ) ];
        default: throw new Error( 'Invalid vertice number' );
    }
};

var compileGeometry = function ( geometryNode, vertexCount ) {

    var subfSet = geometryNode
        .children( 'FACE' )
        .children( 'SUBF' )
        .filter( function ( node ) {
            return node.children( 'VCNT' ).prop( 'content' ) === vertexCount;
        } );

    var faceCount = subfSet.count( );
    var trianglePerFace = vertexCount - 2;
    var triangleCount = faceCount * trianglePerFace;

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
            numItems : triangleCount * 3 * 3 } };

    subfSet.forEach( function ( faceNode, faceIndex ) {
        triangulize( faceNode.children( 'VERT' ) ).forEach( function ( vertices, triangleIndex ) {
            vertices.forEach( function ( verticeNode, verticeIndex ) {
                var firstOffset = function ( attribute ) {
                    return ( ( ( ( faceIndex * 2 ) + triangleIndex ) * 3 ) + verticeIndex ) * attribute.itemSize; };

                var vertexData = verticeNode.prop( 'content' );

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
            } );
        } );
    } );

    geometry.dynamic = true;
    geometry.offsets = [ {
        start : 0,
        count : triangleCount * 3,
        index : 0
    } ];

    geometry.computeBoundingSphere( );

    return geometry;

};

exports.ThreeEntity = function ( root ) {

    THREE.Object3D.call( this );

    root.children( 'RTWF' )
        .children( 'WRLD' )
        .children( 'ECHI' )
        .children( 'BRSH' )
        .children( 'IFID' )
        .forEach( function ( node ) {
            var ifid = node.prop( 'content' );
            var geometryData = root.children( 'RTWF' )
                .children( 'XTRA' )
                .children( 'BGEO' )
                .children( 'BRSH' )
                .filter( function ( node ) {
                    return node.children( 'IFID' ).prop( 'content' ) === ifid; } );

            if ( geometryData.empty( ) )
                return ;

            var material = new THREE.MeshLambertMaterial( { color : 'red', wireframe : true, side : THREE.DoubleSide } );
            this.add( new THREE.Mesh( compileGeometry( geometryData, 3 ), material ) );
            this.add( new THREE.Mesh( compileGeometry( geometryData, 4 ), material ) );

        }, this );

};

var F = function ( ) { };
F.prototype = typeof THREE !== 'undefined' ? THREE.Object3D.prototype : { };
exports.ThreeEntity.prototype = new F( );
