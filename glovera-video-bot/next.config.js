const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  reactStrictMode: false,
  webpack: (config, {  }) => {
    config.resolve.extensions.push(".ts", ".tsx");
    config.resolve.fallback = { fs: false };

    config.plugins.push(
      new NodePolyfillPlugin(), 
      new CopyPlugin({
        patterns: [
            {
                      from: './node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
                      to: 'static/chunks/',
                    }, 
             {
                         from: './node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm',
                         to: 'static/chunks/',
         },
     {from: './src/vad/data/silero_vad.onnx',
                 to: 'static/chunks/',}

     ],
      }),
    );

    return config;
  },
  images: {
    domains: ['soulfiles007.s3.us-east-1.amazonaws.com'],
  },
  serverRuntimeConfig: {
    maxBodySize: '50mb', // Adjust this value as needed
  },
}
