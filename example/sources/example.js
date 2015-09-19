window.addEventListener( 'load', function ( ) {

    var renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
    renderer.setClearColor( 0xFFFFFF );
    renderer.setClearAlpha( 0 );

    renderer.context.getExtension( 'OES_texture_float' );
    renderer.context.getExtension( 'OES_texture_float_linear' );

    var camera = new THREE.PerspectiveCamera( 60, 1, .1, 10000 );
    camera.position.set( 1000, 1000, 1000 );
    camera.updateMatrixWorld( );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    var scene = new THREE.Scene( );
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

    load( );
    resize( );

    RTWorldReader.loadUrl( 'assets/tut06.rtw' ).then( function ( worldNode ) {

        var world = new RTWorldReader.ThreeEntity( worldNode );
        scene.add( world );

        if ( world.all.p1 ) {
            camera.position.copy( world.all.p1.position );
            camera.updateMatrixWorld( );
        }

        if ( world.all.p1target ) {
            camera.lookAt( world.all.p1target.position );
        } else {
            camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
        }

    } );

} );
