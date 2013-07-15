// Generated by CommonJS Everywhere 0.7.0
(function (global) {
  function require(file, parentModule) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
        id: file,
        require: require,
        filename: file,
        exports: {},
        loaded: false,
        parent: parentModule,
        children: []
      };
    if (parentModule)
      parentModule.children.push(module$);
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports;
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0;
  };
  require.define = function (file, fn) {
    require.modules[file] = fn;
  };
  var process = function () {
      var cwd = '/';
      return {
        title: 'browser',
        version: 'v0.10.5',
        browser: true,
        env: {},
        argv: [],
        nextTick: global.setImmediate || function (fn) {
          setTimeout(fn, 0);
        },
        cwd: function () {
          return cwd;
        },
        chdir: function (dir) {
          cwd = dir;
        }
      };
    }();
  require.define('/sources/index.js', function (module, exports, __dirname, __filename) {
    var debug = require('/sources/debug.js', module);
    exports.LOG_NONE = debug.LOG_NONE;
    exports.LOG_NOTICE = debug.LOG_NOTICE;
    exports.LOG_WARNING = debug.LOG_WARNING;
    exports.LOG_ERROR = debug.LOG_ERROR;
    exports.LOG_FATAL = debug.LOG_FATAL;
    exports.debug = debug.flags;
    var loaders = require('/sources/loaders.js', module);
    exports.loadBuffer = loaders.loadBuffer.bind(loaders);
    exports.loadUrl = loaders.loadUrl.bind(loaders);
    var tree = require('/sources/tree.js', module);
    exports.Node = tree.Node.bind(tree);
    var three = require('/sources/three.js', module);
    exports.ThreeEntity = three.ThreeEntity.bind(three);
  });
  require.define('/sources/three.js', function (module, exports, __dirname, __filename) {
    var debug = require('/sources/debug.js', module);
    var triangulate = function (verticeNodes) {
      var vertices = [];
      for (var t = 2, T = verticeNodes.count(); t < T; ++t)
        vertices.push([
          verticeNodes.at(0),
          verticeNodes.at(t - 1),
          verticeNodes.at(t)
        ]);
      return vertices;
    };
    var copyArray = function (destination, source, offsetD, paddingD, offsetS, paddingS, map) {
      if (typeof offsetD === 'undefined')
        offsetD = 0;
      if (typeof paddingD === 'undefined')
        paddingD = 1;
      if (typeof offsetS === 'undefined')
        offsetS = offsetD;
      if (typeof paddingS === 'undefined')
        paddingS = paddingD;
      if (typeof map === 'undefined')
        map = function (source, offset) {
          return source[offset];
        };
      var iterationsD = Math.floor((destination.length - offsetD) / paddingD);
      var iterationsS = Math.floor((source.length - offsetS) / paddingS);
      var iterations = Math.min(iterationsD, iterationsS);
      while (iterations--) {
        destination[offsetD] = map(source, offsetS);
        offsetD += paddingD;
        offsetS += paddingS;
      }
    };
    var Parent = typeof THREE === 'undefined' ? function () {
        throw new Error('Three.js must be loaded before RTWorldReader in order to use RTWorldReader.ThreeEntity');
      } : THREE.Object3D;
    exports.ThreeEntity = function (root) {
      Parent.call(this);
      this._textures = {};
      this._lightmaps = [];
      this._rawBrushes = {};
      debug.flags.compiling && debug.group('World generation (Three.js entity)');
      debug.flags.compiling && debug.group('Extra data extraction phase', true);
      this._loadXtraTextures(root.children('RTWF').children('XTRA').children('TEXD').children('TXTR'));
      this._loadXtraLightmaps(root.children('RTWF').children('XTRA').children('LIMD'));
      this._loadXtraBrushes(root.children('RTWF').children('XTRA').children('BGEO').children('BRSH'));
      debug.flags.compiling && debug.groupEnd();
      debug.flags.compiling && debug.group('Compilation phase');
      this._compileBrushes(root.children('RTWF').children('WRLD').children('ECHI').children('BRSH'));
      debug.flags.compiling && debug.groupEnd();
      debug.flags.compiling && debug.groupEnd();
    };
    exports.ThreeEntity.FORMAT_8B = 0;
    exports.ThreeEntity.FORMAT_8BA = 1;
    exports.ThreeEntity.FORMAT_8BM = 2;
    exports.ThreeEntity.FORMAT_16BFF = 3;
    exports.ThreeEntity.FORMAT_32BF = 4;
    var F = function () {
    };
    F.prototype = Parent.prototype;
    exports.ThreeEntity.prototype = new F;
    exports.ThreeEntity.prototype._apply8bSource = function (destination, source) {
      source = new Uint8Array(source);
      copyArray(destination, source, 0, 4, 0, 3);
      copyArray(destination, source, 1, 4, 1, 3);
      copyArray(destination, source, 2, 4, 2, 3);
    };
    exports.ThreeEntity.prototype._apply8baData = function (destination, source) {
      source = new Uint8Array(source);
      copyArray(destination, source, 0, 4);
      copyArray(destination, source, 1, 4);
      copyArray(destination, source, 2, 4);
      copyArray(destination, source, 3, 4);
    };
    exports.ThreeEntity.prototype._apply8bmSource = function (destination, source) {
      source = new Uint8Array(source);
      copyArray(destination, source, 0, 4, 0, 1);
      copyArray(destination, source, 1, 4, 0, 1);
      copyArray(destination, source, 2, 4, 0, 1);
    };
    exports.ThreeEntity.prototype._apply16bffData = function (destination, source) {
      var unfix = function (source, offset) {
        return (source[offset] | source[offset + 1] << 8) / 256;
      };
      source = new Uint8Array(source);
      copyArray(destination, source, 0, 4, 0, 6, unfix);
      copyArray(destination, source, 1, 4, 2, 6, unfix);
      copyArray(destination, source, 2, 4, 4, 6, unfix);
    };
    exports.ThreeEntity.prototype._apply32bfData = function (destination, source) {
      source = new Float32Array(source);
      copyArray(destination, source, 0, 4, 0, 3);
      copyArray(destination, source, 1, 4, 1, 3);
      copyArray(destination, source, 2, 4, 2, 3);
    };
    exports.ThreeEntity.prototype._applyData = function (destination, format, source) {
      switch (format) {
      case exports.ThreeEntity.FORMAT_8B:
        this._apply8bData(destination, source);
        break;
      case exports.ThreeEntity.FORMAT_8BA:
        this._apply8baData(destination, source);
        break;
      case exports.ThreeEntity.FORMAT_8BM:
        this._apply8bmData(destination, source);
        break;
      case exports.ThreeEntity.FORMAT_16BFF:
        this._apply16bffData(destination, source);
        break;
      case exports.ThreeEntity.FORMAT_32BF:
        this._apply32bfData(destination, source);
        break;
      }
    };
    exports.ThreeEntity.prototype._createImage = function (width, height, format, data) {
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var context = canvas.getContext('2d');
      var destination = context.createImageData(canvas.width, canvas.height);
      this._applyData(destination.data, format, data);
      context.putImageData(destination, 0, 0);
      document.body.appendChild(canvas);
      return canvas;
    };
    exports.ThreeEntity.prototype._loadXtraTextures = function (textureNodes) {
      textureNodes.forEach(function (textureNode) {
        var texn = textureNode.children('TEXN').prop('content');
        var width = textureNode.children('TWID').prop('content');
        var height = textureNode.children('THEI').prop('content');
        var format = textureNode.children('PFMT').prop('content');
        var data = textureNode.children('DATA').prop('content');
        if (debug.flags.compiling && debug.flags.textures)
          debug.notice('Extracting data from texture "' + texn + '" (' + width + 'x' + height + ')');
        var texture = this._textures[texn] = new THREE.Texture(this._createImage(width, height, { 0: exports.ThreeEntity.FORMAT_8BA }[format], data));
        texture.needsUpdate = true;
      }, this);
    };
    exports.ThreeEntity.prototype._loadXtraLightmaps = function (lightmapNodes) {
      lightmapNodes.forEach(function (lightmapNode) {
        var lmid = lightmapNode.children('LMID').prop('content');
        var width = lightmapNode.children('LWID').prop('content');
        var height = lightmapNode.children('LHEI').prop('content');
        var format = lightmapNode.children('LFMT').prop('content');
        var data = lightmapNode.children('DATA').prop('content');
        if (debug.flags.compiling && debug.flags.lightmaps)
          debug.notice('Extracting data from texture #' + lmid + ' (' + width + 'x' + height + ')');
        var texture = this._lightmaps[lmid] = new THREE.Texture(this._createImage(width, height, {
            0: exports.ThreeEntity.FORMAT_8B,
            1: exports.ThreeEntity.FORMAT_16BFF,
            2: exports.ThreeEntity.FORMAT_32BF,
            3: exports.ThreeEntity.FORMAT_8BM
          }[format], data));
        texture.needsUpdate = true;
      });
    };
    exports.ThreeEntity.prototype._loadXtraBrushes = function (brushNodes) {
      var brushes = this._rawBrushes = {};
      brushNodes.forEach(function (brushNode) {
        var ifid = brushNode.children('IFID').prop('content');
        var brush0Entry = brushes[ifid] = {};
        if (debug.flags.compiling && debug.flags.brushes)
          debug.notice('Extracting geometry from brush #' + ifid);
        brushNodes.children('FACE').forEach(function (faceNode) {
          var texn = faceNode.children('TEXN').prop('content');
          var brush1Entry = brush0Entry[texn] = brush0Entry[texn] || {};
          faceNode.children('SUBF').forEach(function (subfNode) {
            var lmid = faceNode.children('LMID').prop('content') || '';
            var brush2Entry = brush1Entry[lmid] = brush1Entry[lmid] || [];
            triangulate(subfNode.children('VERT')).forEach(function (triangle) {
              brush2Entry.push(triangle);
            });
          });
        });
      });
    };
    exports.ThreeEntity.prototype._compileBrushes = function (brushNodes) {
      brushNodes.forEach(function (brushNode) {
        var ifid = brushNode.children('IFID').prop('content');
        var rawBrush = this._rawBrushes[ifid];
        if (debug.flags.compiling)
          debug.assert(rawBrush, "Raw brush data wasn't found in file. Did you forget to save extra data (BGEO chunk) ?");
        if (!rawBrush)
          return;
        Object.keys(rawBrush).forEach(function (texn) {
          Object.keys(rawBrush[texn]).forEach(function (lmid) {
            var texture = this._textures[texn];
            var lightmap = this._lightmaps[lmid];
            if (debug.compiling)
              debug.assert(texture, "Raw texture data hadn't been found in file. Did you forget to save extra data (TEXD chunk) ?");
            if (debug.compiling)
              debug.assert(lightmap, "Raw lightmap data hadn't been found in file. Did you forget to save extra data (LIMD chunk) ?");
            if (!texture)
              return;
            var materialData = { map: texture };
            if (lightmap)
              materialData.lightmap = lightmap;
            var geometry = this._compileGeometry(rawBrush[texn][lmid]);
            var material = new THREE.MeshLambertMaterial(materialData);
            if (debug.flags.compiling)
              debug.notice('One more mesh in the world bucket');
            this.add(new THREE.Mesh(geometry, material));
          }, this);
        }, this);
      }, this);
    };
    exports.ThreeEntity.prototype._compileGeometry = function (triangles) {
      var triangleCount = triangles.length;
      var geometry = new THREE.BufferGeometry;
      geometry.attributes = {
        index: {
          itemSize: 1,
          array: new Uint16Array(triangleCount * 3),
          numItems: triangleCount * 3
        },
        position: {
          itemSize: 3,
          array: new Float32Array(triangleCount * 3 * 3),
          numItems: triangleCount * 3 * 3
        },
        normal: {
          itemSize: 3,
          array: new Float32Array(triangleCount * 3 * 3),
          numItems: triangleCount * 3 * 3
        },
        uv: {
          itemSize: 2,
          array: new Float32Array(triangleCount * 3 * 2),
          numItems: triangleCount * 3 * 2
        }
      };
      triangles.forEach(function (vertices, triangleIndex) {
        vertices.forEach(function (vertexNode, vertexIndex) {
          var firstOffset = function (attribute) {
            return (triangleIndex * 3 + vertexIndex) * attribute.itemSize;
          };
          var vertexData = vertexNode.prop('content');
          var indexOffset = firstOffset(geometry.attributes.index);
          geometry.attributes.index.array[indexOffset] = indexOffset;
          var positionOffset = firstOffset(geometry.attributes.position);
          geometry.attributes.position.array[positionOffset + 0] = vertexData.x;
          geometry.attributes.position.array[positionOffset + 1] = vertexData.y;
          geometry.attributes.position.array[positionOffset + 2] = vertexData.z;
          var normalOffset = firstOffset(geometry.attributes.normal);
          geometry.attributes.normal.array[normalOffset + 0] = vertexData.nx;
          geometry.attributes.normal.array[normalOffset + 1] = vertexData.ny;
          geometry.attributes.normal.array[normalOffset + 2] = vertexData.nz;
          var uvOffset = firstOffset(geometry.attributes.uv);
          var normalize = function (n) {
            n = n % 1;
            return n < 0 ? 1 + n : n;
          };
          geometry.attributes.uv.array[uvOffset + 0] = normalize(vertexData.st);
          geometry.attributes.uv.array[uvOffset + 1] = normalize(vertexData.tt);
        });
      });
      geometry.offsets = [{
          start: 0,
          count: triangleCount * 3,
          index: 0
        }];
      geometry.computeBoundingSphere();
      return geometry;
    };
  });
  require.define('/sources/debug.js', function (module, exports, __dirname, __filename) {
    exports.LOG_NONE = 0;
    exports.LOG_NOTICE = 1;
    exports.LOG_WARNING = 2;
    exports.LOG_ERROR = 3;
    exports.LOG_FATAL = 4;
    var flags = exports.flags = {
        level: exports.LOG_NONE,
        loading: false,
        compiling: false,
        brushes: false,
        textures: false,
        lightmaps: false
      };
    exports.group = function (message, collapsed) {
      if (flags.level < exports.LOG_NOTICE)
        return;
      console[collapsed ? 'groupCollapsed' : 'group'](message);
    };
    exports.groupEnd = function () {
      if (flags.level < exports.LOG_NOTICE)
        return;
      console.groupEnd();
    };
    exports.notice = function (message) {
      if (flags.level < exports.LOG_NOTICE)
        return;
      console.info(message);
    };
    exports.warning = function (message) {
      if (flags.level < exports.LOG_WARNING)
        return;
      console.warn(message);
    };
    exports.assert = function (condition, message) {
      if (condition)
        return;
      if (flags.level < exports.LOG_ERROR)
        return;
      if (flags.level < exports.LOG_FATAL)
        console.error(message);
      else
        throw new Error(message);
    };
  });
  require.define('/sources/tree.js', function (module, exports, __dirname, __filename) {
    var Node = function (element) {
      if (element.constructor === Node)
        element = element.array();
      if (element.constructor !== Array)
        element = [element];
      this._set = element;
      this.flatten();
    };
    Node.prototype.empty = function () {
      return this._set.length === 0;
    };
    Node.prototype.count = function () {
      return this._set.length;
    };
    Node.prototype.array = function () {
      return this._set.slice();
    };
    Node.prototype.prop = function (name) {
      var element = this.get();
      return element ? element[name] : undefined;
    };
    Node.prototype.get = function (n) {
      return this._set[n || 0];
    };
    Node.prototype.at = function (n) {
      return new Node(this.get(n));
    };
    Node.prototype.slice = function (begin, end) {
      return new Node(this._set.slice(begin, end));
    };
    Node.prototype.forEach = function (fn, context) {
      this._set.forEach(function (node, index) {
        fn.call(this, new Node(node), index);
      }, context || this);
      return this;
    };
    Node.prototype.map = function (fn, context) {
      return new Node(this._set.map(function (node, index) {
        return fn.call(this, new Node(node), index);
      }, context || this));
    };
    Node.prototype.filter = function (fn, context) {
      return new Node(this._set.filter(function (node, index) {
        return fn.call(this, new Node(node), index);
      }, context || this));
    };
    Node.prototype.flatten = function () {
      this._set = function recursiveFlattener(chunks, output) {
        chunks.forEach(function (chunk) {
          if (chunk.constructor === Node)
            chunk = chunk.array();
          if (chunk.constructor === Array) {
            recursiveFlattener(chunk, output);
          } else {
            output.push(chunk);
          }
        });
        return output;
      }(this._set, []);
      return this;
    };
    Node.prototype.prepend = function () {
      this._set = [].concat(Array.prototype.map.call(arguments, function (arg) {
        if (arg.constructor === Node)
          arg = arg.array();
        if (arg.construtor !== Array)
          arg = [arg];
        return arg;
      }), this._set);
      return this.flatten();
    };
    Node.prototype.append = function (element) {
      this._set = [].concat(this._set, Array.prototype.map.call(arguments, function (arg) {
        if (arg.constructor === Node)
          arg = arg.array();
        if (arg.construtor !== Array)
          arg = [arg];
        return arg;
      }));
      return this.flatten();
    };
    Node.prototype.children = function (label) {
      return this.filter(function (element) {
        return element.prop('children');
      }).map(function (element) {
        return element.prop('children');
      }).flatten().filter(function (element) {
        return !label || element.prop('label') === label;
      });
    };
    Node.prototype.descendants = function () {
      var set = this.children();
      return set.append(set.map(function (element) {
        return new Node(element).descendants();
      }));
    };
    Node.prototype.find = function () {
      var labels = Array.prototype.slice.call(arguments);
      return this.descendants().filter(function (node) {
        return labels.indexOf[node.prop('label')] !== -1;
      });
    };
    exports.Node = Node;
  });
  require.define('/sources/loaders.js', function (module, exports, __dirname, __filename) {
    var debug = require('/sources/debug.js', module);
    var dictionaries = require('/sources/dictionaries.js', module);
    var parsers = require('/sources/parsers.js', module);
    var tree = require('/sources/tree.js', module);
    var stringify = function (int32) {
      return String.fromCharCode(int32 >> 0 & 255) + String.fromCharCode(int32 >> 8 & 255) + String.fromCharCode(int32 >> 16 & 255) + String.fromCharCode(int32 >> 24 & 255);
    };
    var readChunks = function (stack, dict, dataView) {
      var chunks = [], lastChunk;
      for (var pointer = 0; pointer < dataView.byteLength; pointer += lastChunk.fullSize) {
        var id = dataView.getUint32(pointer, true);
        var label = stringify(id);
        if (id === 0)
          break;
        var size = dataView.getInt32(pointer + 4, true);
        var chunk = lastChunk = {
            id: id,
            label: label,
            size: size,
            fullSize: size + 8,
            content: null
          };
        if (!dict.hasOwnProperty(label)) {
          if (debug.flags.loading)
            debug.warning('Unrecognized ' + label + ' chunk -- ignored');
          continue;
        }
        if (dict[label] && dict[label].constructor === Object) {
          if (debug.flags.loading)
            debug.group(label + ' chunk');
          var subDataView = new DataView(dataView.buffer, dataView.byteOffset + pointer + 8, dataView.byteLength - pointer - 8);
          chunk.children = readChunks(stack.concat([label]), dict[label], subDataView);
          if (debug.flags.loading)
            debug.groupEnd();
        } else if (dict[label] && dict[label].constructor === String) {
          chunk.content = parsers[dict[label]](dataView, pointer + 8, size);
          if (debug.flags.loading)
            debug.notice('Parsing ' + label + ' chunk using ' + dict[label] + ' strategy (gives ' + chunk.content + ')');
        } else {
          chunk.content = dataView.buffer.slice(dataView.byteOffset + pointer + 8, dataView.byteOffset + pointer + 8 + size);
          if (debug.flags.loading)
            debug.notice('Registering ' + label + ' chunk as data buffer');
        }
        chunks.push(chunk);
      }
      return chunks;
    };
    exports.loadBuffer = function (buffer, callback) {
      if (debug.flags.loading)
        debug.group('World file loading', true);
      var dataView = new DataView(buffer, 0, buffer.byteLength);
      var chunks = readChunks([], dictionaries.ROOT, dataView);
      if (debug.flags.loading)
        debug.groupEnd();
      callback(null, new tree.Node({ children: chunks }));
    };
    exports.loadUrl = function (url, callback) {
      var xhr = new XMLHttpRequest;
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function (event) {
        exports.loadBuffer(xhr.response, callback);
      };
      xhr.send(null);
    };
  });
  require.define('/sources/parsers.js', function (module, exports, __dirname, __filename) {
    exports.signed = function (dataView, offset, length) {
      return dataView['getInt' + length * 8](offset, true);
    };
    exports.unsigned = function (dataView, offset, length) {
      return dataView['getUint' + length * 8](offset, true);
    };
    exports.float = function (dataView, offset, length) {
      return dataView['getFloat' + length * 8](offset, true);
    };
    exports.boolean = function (dataView, offset, length) {
      return dataView.getUint8(offset) !== 0;
    };
    exports.string = function (dataView, offset, length) {
      var utf16 = new ArrayBuffer(length * 2);
      var utf16View = new Uint16Array(utf16);
      for (var i = 0; i < length; ++i)
        utf16View[i] = dataView.getUint8(offset + i);
      return String.fromCharCode.apply(String, utf16View);
    };
    exports.vertice = function (dataView, offset, length) {
      var vertice = {};
      vertice.x = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.y = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.z = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.nx = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.ny = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.nz = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.st = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.tt = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.r = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.g = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.b = dataView.getFloat64(offset, true);
      offset += 8;
      vertice.sl = offset < length ? dataView.getFloat64(offset, true) : null;
      offset += 8;
      vertice.tl = offset < length ? dataView.getFloat64(offset, true) : null;
      offset += 8;
      vertice.toString = function () {
        return JSON.stringify(this);
      };
      return vertice;
    };
  });
  require.define('/sources/dictionaries.js', function (module, exports, __dirname, __filename) {
    exports.ECHI = {
      AENT: { IFID: 'unsigned' },
      BRSH: {
        IFID: 'unsigned',
        TYPE: 'unsigned'
      },
      FACE: {
        IFID: 'unsigned',
        NORX: 'float',
        NORY: 'float',
        NORZ: 'float',
        PLND: 'float',
        TROT: 'float',
        SCAS: 'float',
        SCAT: 'float',
        SHIS: 'float',
        SHIT: 'float',
        COLO: null,
        TEXN: 'string'
      },
      PLGT: {
        IFID: 'unsigned',
        POSX: 'float',
        POSY: 'float',
        POSZ: 'float',
        RADI: 'float',
        COLR: 'float',
        COLG: 'float',
        COLB: 'float'
      },
      UENT: {
        IFID: 'unsigned',
        POSX: 'float',
        POSY: 'float',
        POSZ: 'float',
        NAME: 'string'
      }
    };
    exports.WRLD = {
      IFID: 'unsigned',
      ENAM: 'string',
      HIDE: 'boolean',
      TXPU: 'float',
      NOTS: 'boolean',
      NOTE: 'string',
      LNKS: {
        FRST: 'unsigned',
        SCND: 'unsigned'
      },
      ECHI: exports.ECHI
    };
    exports.XTRA = {
      BGEO: {
        BRSH: {
          IFID: 'unsigned',
          BFCT: 'unsigned',
          FACE: {
            TEXN: 'string',
            SFCT: 'unsigned',
            SUBF: {
              LMID: 'signed',
              VCNT: 'unsigned',
              VERT: 'vertice'
            }
          }
        }
      },
      TEXD: {
        TXTR: {
          TEXN: 'string',
          TWID: 'unsigned',
          THEI: 'unsigned',
          PFMT: 'unsigned',
          DATA: null
        }
      }
    };
    exports.ROOT = {
      RTWF: {
        VRSN: 'unsigned',
        WRLD: exports.WRLD,
        XTRA: exports.XTRA
      }
    };
    exports.ECHI.AENT.ECHI = exports.ECHI;
    exports.ECHI.BRSH.ECHI = { FACE: exports.ECHI.FACE };
  });
  global.RTWorldReader = require('/sources/index.js');
}.call(this, this));