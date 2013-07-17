> **Warning:** Currently in development. Features are missing and will be added.

# RTWorldReader

Javascript library parsing `.rtw` files, such as the ones generated by the [Runtime World](http://runtimelegend.com/rep/rtworld/index) editor. Useful for 3D games, allowing to avoid having to write a custom level maker.

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

Returns a new Three.js entity, ready to be inserted in a scene. You of course need to include Three.js in order to use this element. Each entity named in the world editor will be available threw one of the following properties :

- `RTWorldLoader#groups` (`AENT` chunks)
- `RTWorldLoader#lights` (`PLGT` chunks)
- `RTWorldLoader#entities` (`UENT` chunks)

You can also use `RTWorldLoader#all`, which will contains a full map of the entities, regardless their type. Please note that entities other that groups, lights and user entities are not registed at all.

<hr />

### For developers

#### RTWorldReader.debug

Object containing the following debug flags that you can toggle to switch verbosity :

  - `level`, can be one of the following :
      - `RTWorldReader.LOG_NONE`
      - `RTWorldReader.LOG_NOTICE`
      - `RTWorldReader.LOG_WARNING`
      - `RTWorldReader.LOG_ERROR`
      - `RTWorldReader.LOG_FATAL`
  - `loading`, boolean
  - `compiling`, boolean
  - `textures`, boolean
  - `lightmaps`, boolean
  - `brushes`, boolean

You sometime have to switch on multiple flags to display some informations.

#### new RTWorldReader.Node( [:] )

A node instance is a jQuery-like object which has the following method :

  * `array( )`
  * `get( [ n ] )`
  * `at( [ n ] )`
  * `slice( [ begin [, end ] ] )`
  * `append( item1, ... )`
  * `prepend( item1, ... )`
  * `forEach( fn, context )`
  * `map( fn, context )`
  * `filter( fn, context )`
  * `children( [ label ] )`
  * `find( label )`
  * `descendants( )`
  * `prop( name )`
  * `content( [ label ] )`

You should not have to manipulate nodes, except if you need to write your own importer. If that's what you're looking for, consider looking at the source code of bundled importers such as the [three.js one](https://github.com/arcanis/RTWorldReader/blob/master/sources/three.js) to find out how to use them. But really, it's just like a jQuery object.

## Examples

You can see live examples [here](http://arcanis.github.io/RTWorldReader/examples/) (source code [here](https://github.com/arcanis/RTWorldReader/blob/master/example/sources/example.js)).

![Demonstration](http://www.clipular.com/c?10640001=JDV8JImJjOLmcgfDx49dES4s0us&f=.png)

## License (MIT)

> **Copyright (C) 2013 Maël Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
