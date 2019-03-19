import { Matrix } from 'matrixmath';
import { flattenDeep, includes } from 'lodash';
import { loadPositions } from './gltf-reader';

import precise from './precise';

const gltf2BoundingBox = {

  computeBoundings(gltf, buffers=[], precision=0) {
    const boundings = this.getMeshesTransformMatrices(gltf.nodes, gltf, buffers).reduce((acc, point) => {
        acc.min = acc.min.map((elt, i) => elt < point[i] ? elt : point[i]);
        acc.max = acc.max.map((elt, i) => elt > point[i] ? elt : point[i]);
        return acc;
    },{min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity]});

    // Return the dimensions of the bounding box
    const res =  {
      dimensions: {
        width: precise.round(boundings.max[0] - boundings.min[0], precision),
        depth: precise.round(boundings.max[2] - boundings.min[2], precision),
        height: precise.round(boundings.max[1] - boundings.min[1], precision),
      },
      center: {
        x: precise.round((boundings.max[0] + boundings.min[0]), precision) / 2,
        y: precise.round((boundings.max[2] + boundings.min[2]), precision) / 2,
        z: precise.round((boundings.max[1] + boundings.min[1]), precision) / 2,
      },
    };

    return res;
  },

  getMeshesTransformMatrices(nodes, gltf, buffers) {
    nodes.forEach((node, index) => node.index = index);

    return nodes

      // Get every node which have meshes
      .filter(node => (node.mesh !== undefined))

      .reduce((acc, node) => {
        // Climb up the tree to retrieve all the transform matrices
        const matrices = this.getParentNodesMatrices(node, nodes)
          .map(transformMatrix => new Matrix(4, 4, false).setData(transformMatrix));

        // Compute the global transform matrix
        const matrix = Matrix.multiply(...matrices);
        const positions = this.getPointsFromArray(loadPositions(gltf, node.mesh, buffers));

        const transformedPoints = positions.map(point =>  Matrix.multiply(point, matrix));

        // Changed from acc.push(...transformedPoints) to avoid encountering a 
        // `RangeError: Maximum call stack size exceeded` when the arguments would be too many.
        // See https://github.com/nodejs/node/issues/16870#issuecomment-342720915 for more information
        transformedPoints.forEach(p => acc.push(p));

        return acc;
    }, []);
  },

  getParentNodesMatrices(childNode, nodes) {
    // Find the node which has the given node as a child
    const parentNode = nodes
      .find(
        node => node.children &&
        includes(node.children, childNode.index)
      );

    // Specify identity matrix if not present
    const childNodeMatrix = childNode.matrix || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    return (parentNode !== undefined) ?

      // If found, return the current matrix and continue climbing
      [
        childNodeMatrix,
        ...this.getParentNodesMatrices(parentNode, nodes),
      ].filter(matrix => matrix) :

      // If not, only return the current matrix (if any)
      [childNodeMatrix];
  },

  getPointsFromArray(array) {
    const res = [];
    for (let i = 0; i < array.length ; i+=3) {
        res.push(new Matrix(1,4,false).setData([array[i], array[i+1], array[i+2], 1]));
    }
    return res;
  },

};

export default gltf2BoundingBox;
