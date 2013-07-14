var Node = function ( element ) {

    if ( element.constructor === Node )
        element = element.array( );

    if ( element.constructor !== Array )
        element = [ element ];

    this._set = element;
    this.flatten( );

};

Node.prototype.empty = function ( ) {

    return this._set.length === 0;

};

Node.prototype.count = function ( ) {

    return this._set.length;

};

Node.prototype.array = function ( ) {

    return this._set.slice( );

};

Node.prototype.prop = function ( name ) {

    return this.get( )[ name ];

};

Node.prototype.get = function ( n ) {

    return this._set[ n || 0 ];

};

Node.prototype.at = function ( n ) {

    return new Node( this.get( n ) );

};

Node.prototype.slice = function ( begin, end ) {

    return new Node( this._set.slice( begin, end ) );

};

Node.prototype.forEach = function ( fn, context ) {

    this._set.forEach( function ( node, index ) {
        fn.call( this, new Node( node ), index );
    }, context || this );

    return this;

};

Node.prototype.map = function ( fn, context ) {

    return new Node( this._set.map( function ( node, index ) {
        return fn.call( this, new Node( node ), index );
    }, context || this ) );

};

Node.prototype.filter = function ( fn, context ) {

    return new Node( this._set.filter( function ( node, index ) {
        return fn.call( this, new Node( node ), index );
    }, context || this ) );

};

Node.prototype.flatten = function ( ) {
    this._set = ( function recursiveFlattener( chunks, output ) {

        chunks.forEach( function ( chunk ) {
            if ( chunk.constructor === Node )
                chunk = chunk.array( );
            if ( chunk.constructor === Array ) {
                recursiveFlattener( chunk, output );
            } else {
                output.push( chunk );
            }
        } );

        return output;

    } )( this._set, [ ] );

    return this;
};

Node.prototype.prepend = function ( ) {

    this._set = [ ].concat( Array.prototype.map.call( arguments, function ( arg ) {

        if ( arg.constructor === Node )
            arg = arg.array( );

        if ( arg.construtor !== Array )
            arg = [ arg ];

        return arg;

    } ), this._set );

    return this.flatten( );

};

Node.prototype.append = function ( element ) {

    this._set = [ ].concat( this._set, Array.prototype.map.call( arguments, function ( arg ) {

        if ( arg.constructor === Node )
            arg = arg.array( );

        if ( arg.construtor !== Array )
            arg = [ arg ];

        return arg;

    } ) );

    return this.flatten( );

};

Node.prototype.children = function ( label ) {

    return this
    .filter( function ( element ) {
        return element.prop( 'children' );
    } ).map( function ( element ) {
        return element.prop( 'children' );
    } ).flatten( ).filter( function ( element ) {
        return ! label || element.prop( 'label' ) === label;
    } );

};

Node.prototype.descendants = function ( ) {

    var set = this.children( );

    return set.append( set.map( function ( element ) {
        return new Node( element ).descendants( );
    } ) );

};

Node.prototype.find = function ( ) {

    var labels = Array.prototype.slice.call( arguments );

    return this.descendants( ).filter( function ( node ) {
        return labels.indexOf[ node.prop( 'label' ) ] !== - 1;
    } );

};

exports.Node = Node;
