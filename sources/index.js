var debug = require( './debug' );
exports.debugMode = debug.debugMode.bind( debug );

var loaders = require( './loaders' );
exports.loadBuffer = loaders.loadBuffer.bind( loaders );
exports.loadUrl = loaders.loadUrl.bind( loaders );

var tree = require( './tree' );
exports.Node = tree.Node.bind( tree );

var three = require( './three' );
exports.ThreeEntity = three.ThreeEntity.bind( three );
