( function ( ) {

    var renderer = new THREE.WebGLRenderer( );

    var camera = new THREE.PerspectiveCamera( 60, 1, .1, 10000 );
    camera.position.set( 1000, 1000, 1000 );
    camera.updateMatrixWorld( );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
    camera.add( new THREE.PointLight( 0xffffff ) );

    var scene = new THREE.Scene( );
    scene.add( new THREE.AxisHelper( 100 ) );
    scene.add( camera );

    var clock = new THREE.Clock( );

    var draw = function ( ) {
        window.requestAnimationFrame( draw );
        renderer.render( scene, camera );
    };

    var resize = function ( ) {
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix( );
    };

    var load = function ( ) {
        renderer.domElement.id = 'renderer';
        document.body.appendChild( renderer.domElement );
        resize( );
        draw( );
    };

    window.addEventListener( 'load', load );
    window.addEventListener( 'resize', resize );

    RTWorldReader.debug.level = RTWorldReader.LOG_ERROR;
    RTWorldReader.debug.compiling = true;
    RTWorldReader.debug.textures = true;

    RTWorldReader.loadUrl( 'assets/world.rtw', function ( err, worldNode ) {
        if ( err ) throw err;
        scene.add( new RTWorldReader.ThreeEntity( worldNode ) );
    } );

} )( );
