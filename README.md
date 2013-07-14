> **Warning:** Currently in development. Features are missing.

# RTWorldReader

Javascript library parsing `.rtw` files, such as the one provided by [Runtime World](http://runtimelegend.com/rep/rtworld/index).

## API

### Standard

#### RTWorldReader.loadUrl( url, callback, context )

Load a world from an URL. The URL is expected returning a binary `rtw` file.

The callback parameter will be called when opportune with the specified context. It will get two parameters : the first will be any error which could have happened, and the second will be a `Node` object if the loading succeed.

#### RTWorldReader.loadBuffer( buffer, callback, context )

Load a world from the input buffer.

The callback parameter will be called when opportune with the specified context. It will get two parameters : the first will be any error which could have happened, and the second will be a `Node` object if the loading succeed.

<hr />

### Importers

#### new RTWorldLoader.ThreeEntity( worldNode )

Returns a new Three.js entity, ready to be add in a scene.

<hr />

### For developers

#### RTWorldReader.debugMode( mode )

Enable or disable debug mode (default off). In debug mode, a lot of informations will be output. This mode is mainly used when modifying the library itself, you hopefully shouldn't have to use it.

#### new RTWorldReader.Node( [:] )

A `Node` is a jQuery-like object which has the following method :

  * `append( item1, ... )`
  * `prepend( item1, ... )`
  * `forEach( fn, context )`
  * `map( fn, context )`
  * `filter( fn, context )`
  * `children( [ label ] )`
  * `find( label )`
  * `descendants( )`
  * `prop( name )`

You should not have to manipulate nodes, except if you need to write your own importer. If you have to do it, consider looking at the source code of bundled importers such as the [three.js one](https://github.com/arcanis/RTWorldReader/blob/master/sources/three.js) to find out how to use them. But really, it's just like a jQuery object.

## Examples

You can see live examples [here](http://arcanis.github.io/RTWorldReader/examples/) (source code [here](https://github.com/arcanis/RTWorldReader/blob/master/example/sources/example.js)).

## License (MIT)

> **Copyright (C) 2013 Maël Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
