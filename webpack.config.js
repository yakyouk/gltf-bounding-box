const path = require("path");
const nodeExternals = require("webpack-node-externals");

const build = {
  // Informs webpack it is operating on nodejs module files, not designed for browsers.
  target: "node",
  // Enages a default configuration for properties of webpack not overridden here.
  mode: "production",
  entry: {
    app: [
      // Specifies the path to the entry point js file of the application.
      "./src/app.js",
    ],
  },
  output: {
    // Specifies the directory in which the output files should go.
    path: path.resolve(__dirname, "dist"),
    // Specifies the single output JS file to create
    filename: "gltfBoundingBox.js",
    // Specifies the name given to the entry point variable (const function) inside the given entry point JS file.
    library: "gltfBoundingBox",
    // Exposes the entry point variable (const function) under all the module definitions (CommonJS, AMD, global variable)
    libraryTarget: "umd",
  },
  optimization: {
    // Minify the output script?
    minimize: false,
  },
  // module which prevents npm dependencies in node_modules getting packaged into the output.
  externals: [
    nodeExternals(),
    // Uncommented, whitelist WILL include `lodash` and `matrixmath` in the bundle.
    // It's bad practice to package npm dependencies in a single file, especailly when
    // a dependency needs 100's of others. Never package system dependencies like fs.
    // { whitelist: ["lodash.includes", "matrixmath"] }
  ],
};
// function above will run when "npx webpack" is run on its own, from the same directory as this file.
module.exports = build;
