(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["gltfBoundingBox"] = factory();
	else
		root["gltfBoundingBox"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("three");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const Matrix = __webpack_require__(2).Matrix;
const includes = __webpack_require__(3);
const loadPositions = __webpack_require__(4).loadPositions;
const precise = __webpack_require__(5);
const trsMatrix = __webpack_require__(6);

const gltf2BoundingBox = {
  computeBoundings(gltf, buffers = [], { precision, ceilDimensions } = {}) {
    const boundings = this.getMeshesTransformMatrices(gltf.nodes, gltf, buffers).reduce(
      (acc, point) => {
        acc.min = acc.min.map((elt, i) => (elt < point[i] ? elt : point[i]));
        acc.max = acc.max.map((elt, i) => (elt > point[i] ? elt : point[i]));
        return acc;
      },
      { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
    );

    // Return the dimensions of the bounding box
    const dimensionRound = ceilDimensions ? precise.ceil : precise.round;
    const res = {
      dimensions: {
        width: dimensionRound(boundings.max[0] - boundings.min[0], precision),
        depth: dimensionRound(boundings.max[2] - boundings.min[2], precision),
        height: dimensionRound(boundings.max[1] - boundings.min[1], precision),
      },
      center: {
        x: precise.round((boundings.max[0] + boundings.min[0]) / 2, precision + 1),
        y: precise.round((boundings.max[2] + boundings.min[2]) / 2, precision + 1),
        z: precise.round((boundings.max[1] + boundings.min[1]) / 2, precision + 1),
      },
    };

    return res;
  },

  getMeshesTransformMatrices(nodes, gltf, buffers) {
    nodes.forEach((node, index) => (node.index = index));

    return (
      nodes

        // Get every node which have meshes
        .filter((node) => node.mesh !== undefined)

        .reduce((acc, node) => {
          // Climb up the tree to retrieve all the transform matrices
          const matrices = this.getParentNodesMatrices(node, nodes).map((transformMatrix) =>
            new Matrix(4, 4, false).setData(transformMatrix)
          );

          // Compute the global transform matrix
          const matrix = Matrix.multiply(...matrices);
          const positions = this.getPointsFromArray(loadPositions(gltf, node.mesh, buffers));

          const transformedPoints = positions.map((point) => Matrix.multiply(point, matrix));
          return acc.concat(transformedPoints);
        }, [])
    );
  },

  getParentNodesMatrices(childNode, nodes) {
    // Find the node which has the given node as a child
    const parentNode = nodes.find((node) => node.children && includes(node.children, childNode.index));

    // Get matrix or compose TRS fields if present, TRS is by default Identity
    const childNodeMatrix = childNode.matrix || trsMatrix.getTRSMatrix(childNode);

    return parentNode !== undefined
      ? // If found, return the current matrix and continue climbing
        [childNodeMatrix, ...this.getParentNodesMatrices(parentNode, nodes)].filter((matrix) => matrix)
      : // If not, only return the current matrix (if any)
        [childNodeMatrix];
  },

  getPointsFromArray(array) {
    const res = [];
    for (let i = 0; i < array.length; i += 3) {
      res.push(new Matrix(1, 4, false).setData([array[i], array[i + 1], array[i + 2], 1]));
    }
    return res;
  },
};

module.exports = gltf2BoundingBox;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("matrixmath");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("lodash.includes");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const gltfReader = {
  /**
   * @private
   * @param {Object} gltf
   * @param {String|Number} meshName A number in glTF2
   * @param {Object} [buffers={}] External buffers associations uri -> buffer
   * @return {Object} Mesh geometry data
   */
  loadPositions(gltf, meshName, buffers = {}) {
    const mesh = gltf.meshes[meshName];
    const primitivesCount = mesh.primitives ? mesh.primitives.length : 0;

    if (primitivesCount === 0) {
      console.error("gltfReader: Mesh has no primitive.");
      return null;
    }

    let positions = [];
    mesh.primitives.forEach((primitive) => {
      // Attributes
      if (!primitive.attributes) return;

      positions = positions.concat(gltfReader._loadAccessor(gltf, primitive.attributes.POSITION, buffers));
    });

    return positions;
  },

  /**
   * @private
   * @param {Object} gltf
   * @param {String|Number} accessorName A number in glTF2
   * @param {Object} buffers
   * @return {Number[]|null}
   */
  _loadAccessor(gltf, accessorName, buffers) {
    if (accessorName === undefined) return null;

    const accessor = gltf.accessors[accessorName];
    const offset = accessor.byteOffset || 0;

    const buffer = gltfReader._loadBufferView(gltf, accessor.bufferView, offset, buffers);

    const array = [];
    switch (accessor.componentType) {
      case 5123: // UNSIGNED_SHORT
        for (let i = 0; i < buffer.length; i += 2) {
          array.push(buffer.readUInt16LE(i));
        }
        break;
      case 5126: // FLOAT
        for (let i = 0; i < buffer.length; i += 4) {
          array.push(buffer.readFloatLE(i));
        }
        break;
      default:
        console.error("gltfLoader: Unsupported component type: " + accessor.componentType);
    }

    return array;
  },

  /**
   * @private
   * @param {Object} gltf
   * @param {String|Number} bufferViewName A number in glTF2
   * @param {Number} offset
   * @param {Object} buffers
   * @return {Buffer}
   */
  _loadBufferView(gltf, bufferViewName, offset, buffers) {
    const bufferView = gltf.bufferViews[bufferViewName];
    const length = bufferView.byteLength || 0;

    offset += bufferView.byteOffset ? bufferView.byteOffset : 0;

    const buffer = gltfReader._loadBuffer(gltf, bufferView.buffer, buffers);
    return buffer.slice(offset, offset + length);
  },

  /**
   * @private
   * @param {Object} gltf
   * @param {String|Number} bufferName A number in glTF2
   * @param {Object} buffers
   * @return {Buffer}
   */
  _loadBuffer(gltf, bufferName, buffers) {
    if (buffers[bufferName]) {
      return buffers[bufferName];
    }

    const buffer = gltf.buffers[bufferName];

    if (!buffer.uri.startsWith("data:")) {
      console.error("gltfReader: Currently unable to load buffers that are not data-URI based.");
      return null;
    }

    buffers[bufferName] = Buffer.from(buffer.uri.split(",")[1], "base64");
    return buffers[bufferName];
  },
};

module.exports = gltfReader;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

const precise = {
  /**
   * @public
   * @param {Number} number
   * @param {String|Number} precision the precision to round up the number
   * @return {Number} the rounded number
   */
  round(number, precision) {
    return precise._operation(Math.round, number, precision);
  },

  ceil(number, precision = 0) {
    return precise._operation(Math.ceil, number, precision);
  },

  _operation(operation, number, precision = 0) {
    if (precision === 0) {
      return operation(number);
    }
    const factor = Math.pow(10, precision);
    const tempNumber = number * factor;
    const roundedTempNumber = operation(tempNumber);
    return roundedTempNumber / factor;
  },
};

module.exports = precise;


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);


const trsMatrix = {
  /**
   * Get the composed TRS (trasnlation, rotation, scale) affine transformation matrix for a given node.
   *
   * @param {Object} node a node in a GLTF
   * @param {Array<number>} [node.translation] array of 3 values for a translation
   * @param {Array<number>} [node.rotation] an array of four values for a rotation (quaternion)
   * @param {Array<number>} [node.scale] an array of three values for a scale
   */
  getTRSMatrix({ translation, rotation, scale }) {
    const t = translation ? trsMatrix._affineT(translation) : trsMatrix._I();
    const r = rotation ? trsMatrix._affineR(rotation) : trsMatrix._I();
    const s = scale ? trsMatrix._affineS(scale) : trsMatrix._I();

    // Post-multiply: T * R * S
    const TRS = t.multiply(r).multiply(s);

    // toArray returns a column-major, and we need exactly that one
    return TRS.toArray();
  },

  /**
   * Three functions that use `_affine`, to simplify calls above.
   */
  _affineT(t) {
    return trsMatrix._affine({ t });
  },
  _affineR(r) {
    return trsMatrix._affine({ r });
  },
  _affineS(s) {
    return trsMatrix._affine({ s });
  },

  /**
   * Identity 4x4 matrix.
   */
  _I() {
    return new three__WEBPACK_IMPORTED_MODULE_0__["Matrix4"]().identity();
  },

  /**
   * Convert one of the t, r, or s arrays into a 4x4 affine transformation matrix.
   * The passed parameter object p should contain only one of the fields t, r, or s.
   *
   * @param {Object} p
   * @param {Array<number>} [p.t] an array of three values for a transaltion
   * @param {Array<number>} [p.r] an array of four values for a rotation (quaternion)
   * @param {Array<number>} [p.s] an array of three values for a scale
   */
  _affine({ t, r, s }) {
    if (t) {
      return new three__WEBPACK_IMPORTED_MODULE_0__["Matrix4"]().makeTranslation(t[0], t[1], t[2]);
    }
    if (r) {
      return new three__WEBPACK_IMPORTED_MODULE_0__["Matrix4"]().makeRotationFromQuaternion(new three__WEBPACK_IMPORTED_MODULE_0__["Quaternion"](r[0], r[1], r[2], r[3]));
    }
    if (s) {
      return new three__WEBPACK_IMPORTED_MODULE_0__["Matrix4"]().makeScale(s[0], s[1], s[2]);
    }
  },
};

/* harmony default export */ __webpack_exports__["default"] = (trsMatrix);


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(8);


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

const gltf2BoundingBox = __webpack_require__(1);
const gltf1BoundingBox = __webpack_require__(9);
const glb2BoundingBox = __webpack_require__(10);

const gltfBoundingBox = {
  /**
   * @param {Object|Buffer} gltf
   * @param {Buffer} buffers External buffers list if any.
   * @param {Object} options
   * @param {number} options.precision boundings precision, number of decimals.
   * @param {boolean} options.ceilDimensions ceil bounding box dimensions to prevent it of being smaller than the actual object.
   */
  computeBoundings(gltf, buffers = [], options) {
    options = Object.assign(
      {
        precision: 0,
        ceilDimensions: false,
      },
      options
    );
    if (Boolean(gltf.readUInt32LE)) {
      const version = gltf.readUInt32LE(4);
      if (version === 2) {
        return glb2BoundingBox.computeBoundings(gltf, options);
      } else {
        throw new Error("gltf-bounding-box only currently handles glTF1 and glTF/glb2.");
      }
    } else {
      if (+gltf.asset.version === 1) {
        return gltf1BoundingBox.computeBoundings(gltf, options);
      } else if (+gltf.asset.version === 2) {
        return gltf2BoundingBox.computeBoundings(gltf, buffers, options);
      } else {
        throw new Error("gltf-bounding-box only currently handles glTF1 and glTF/glb2.");
      }
    }
  },
};

module.exports = gltfBoundingBox;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

const Matrix = __webpack_require__(2).Matrix;
const includes = __webpack_require__(3);
const loadPositions = __webpack_require__(4).loadPositions;
const precise = __webpack_require__(5);
const trsMatrix = __webpack_require__(6);

const gltf1BoundingBox = {
  computeBoundings(gltf, { precision, ceilDimensions } = {}) {
    // get all the points and retrieve min max
    const boundings = this.getMeshesTransformMatrices(gltf.nodes, gltf).reduce(
      (acc, point) => {
        acc.min = acc.min.map((elt, i) => (elt < point[i] ? elt : point[i]));
        acc.max = acc.max.map((elt, i) => (elt > point[i] ? elt : point[i]));
        return acc;
      },
      { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
    );

    // Return the dimensions of the bounding box
    const dimensionsRound = ceilDimensions === true ? precise.ceil : precise.round;
    const res = {
      dimensions: {
        width: dimensionsRound(boundings.max[0] - boundings.min[0], precision),
        depth: dimensionsRound(boundings.max[2] - boundings.min[2], precision),
        height: dimensionsRound(boundings.max[1] - boundings.min[1], precision),
      },
      center: {
        x: precise.round((boundings.max[0] + boundings.min[0]) / 2, precision + 1),
        y: precise.round((boundings.max[2] + boundings.min[2]) / 2, precision + 1),
        z: precise.round((boundings.max[1] + boundings.min[1]) / 2, precision + 1),
      },
    };

    return res;
  },

  getMeshesTransformMatrices(nodes, gltf) {
    return (
      Object.keys(nodes)

        // Get every node which have meshes
        .filter((nodeName) => nodes[nodeName].meshes)

        // Get a list of every mesh with a reference to its parent node name
        .reduce((meshes, nodeName) => [...meshes, ...nodes[nodeName].meshes.map((mesh) => ({ mesh, nodeName }))], [])

        .reduce((acc, { mesh, nodeName }) => {
          // Climb up the tree to retrieve all the transform matrices
          const matrices = this.getParentNodesMatrices(nodeName, nodes).map((transformMatrix) =>
            new Matrix(4, 4, false).setData(transformMatrix)
          );

          // Compute the global transform matrix
          const matrix = Matrix.multiply(...matrices);
          const positions = this.getPointsFromArray(loadPositions(gltf, mesh));

          const transformedPoints = positions.map((point) => Matrix.multiply(point, matrix));
          return acc.concat(transformedPoints);
        }, [])
    );
  },

  getParentNodesMatrices(childNodeName, nodes) {
    // Find the node which has the given node as a child
    const parentNodeName = Object.keys(nodes).find(
      (nodeName) => nodes[nodeName].children && includes(nodes[nodeName].children, childNodeName)
    );

    // Get matrix or compose TRS fields if present, TRS is by default Identity
    const nodeMatrix = nodes[childNodeName].matrix || trsMatrix.getTRSMatrix(nodes[childNodeName]);

    return parentNodeName
      ? // If found, return the current matrix and continue climbing
        [nodeMatrix, ...this.getParentNodesMatrices(parentNodeName, nodes)].filter((matrix) => matrix)
      : // If not, only return the current matrix (if any)
        [nodeMatrix];
  },

  getPointsFromArray(array) {
    const res = [];
    for (let i = 0; i < array.length; i += 3) {
      res.push(new Matrix(1, 4, false).setData([array[i], array[i + 1], array[i + 2], 1]));
    }
    return res;
  },
};

module.exports = gltf1BoundingBox;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

const gltf2BoundingBox = __webpack_require__(1);

const glb2BoundingBox = {
  computeBoundings(glb, options) {
    // Extract json chunk
    const jsonChunkLength = glb.readUInt32LE(12);
    const jsonChunkData = glb.slice(20, 20 + jsonChunkLength);
    const gltf = JSON.parse(jsonChunkData.toString());

    // Extract bin chunk
    const binChunkOffset = 20 + jsonChunkLength;
    const binChunkLength = glb.readUInt32LE(binChunkOffset);
    const binChunkData = glb.slice(binChunkOffset + 8, binChunkOffset + 8 + binChunkLength);

    return gltf2BoundingBox.computeBoundings(gltf, [binChunkData], options);
  },
};

module.exports = glb2BoundingBox;


/***/ })
/******/ ]);
});