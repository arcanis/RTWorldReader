exports.LOG_NONE = 0;
exports.LOG_NOTICE = 1;
exports.LOG_WARNING = 2;
exports.LOG_ERROR = 3;
exports.LOG_FATAL = 4;

var flags = exports.flags = {
    level : exports.LOG_NONE,
    loading : false,
    compiling : false,
    brushes : false,
    textures : false,
    lightmaps : false
};

exports.group = function ( message, collapsed ) {
    if ( flags.level < exports.LOG_NOTICE ) return ;
    console[ collapsed ? 'groupCollapsed' : 'group' ]( message ); };

exports.groupEnd = function ( ) {
    if ( flags.level < exports.LOG_NOTICE ) return ;
    console.groupEnd( ); };

exports.notice = function ( message ) {
    if ( flags.level < exports.LOG_NOTICE ) return ;
    console.info( message ); };

exports.warning = function ( message ) {
    if ( flags.level < exports.LOG_WARNING ) return ;
    console.warn( message ); };

exports.assert = function ( condition, message ) {
    if ( condition ) return ;
    if ( flags.level < exports.LOG_ERROR ) return ;
    if ( flags.level < exports.LOG_FATAL )
        console.error( message );
    else
        throw new Error( message ); };
