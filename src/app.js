const gltf2BoundingBox  = require("./gltf2-bounding-box.js")
const gltf1BoundingBox  = require("./gltf1-bounding-box.js")
const glb2BoundingBox   = require("./glb2-bounding-box.js")

const gltfBoundingBox = {

  /**
   * @param {Object|Buffer} gltf
   * @param {Buffer} buffers External buffers list if any.
   * @param {Object} options
   * @param {number} options.precision boundings precision, number of decimals.
   * @param {boolean} options.ceilDimensions ceil bounding box dimensions to prevent it of being smaller than the actual object.
   */
  computeBoundings(gltf, buffers = [], options) {
    options = Object.assign({ 
      precision: 0,
      ceilDimensions: false,
    }, options)
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
