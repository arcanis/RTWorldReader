var debugMode = false;

exports.debugMode = function ( mode ) {
    debugMode = mode; };

var format = function ( stack, message ) {
    return stack.map( function ( ) { return '  '; } ).join( '' ) + message; };

exports.notice = function ( stack, message ) {
    debugMode && console.info( format( stack, message ) ); };

exports.warning = function ( stack, message ) {
    debugMode && console.warn( format( stack, message ) ); };
