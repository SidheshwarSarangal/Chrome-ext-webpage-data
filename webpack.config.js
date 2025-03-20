const path = require("path");

module.exports = {
    mode: "production",
    entry: {
        background: "./src/background.js",
        contentScript: "./src/contentScript.js",
        popup: "./src/popup.js",
        groqRequest: "./src/groqRequest.js"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    resolve: {
        extensions: [".js"],
        fallback: {
            // Add fallbacks if needed for jsPDF or other libraries
            fs: false, // jsPDF doesn't require 'fs' in the browser
            path: false,
            crypto: false
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },
    performance: {
        maxAssetSize: 512000,       // 500 KiB
        maxEntrypointSize: 512000   // 500 KiB
    }
};