const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  reactStrictMode: false,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.extensions.push(".ts", ".tsx");
    config.resolve.fallback = { fs: false };

    config.module.rules.push(
      {
        test: /\.(mp4|webm|ogg|swf|ogv)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/_next/static/videos/',
              outputPath: 'static/videos/',
              name: '[name].[hash].[ext]',
            },
          },
        ],
      },
      {
        test: /\.node$/,
        use: [
          {
            loader: "node-loader",
          },
        ],
      }
    );

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
    remotePatterns: [
      {
          protocol: 'https',
          hostname: 'soulfiles007.s3.us-east-1.amazonaws.com',
          port: '',
          pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'glovera.in',
        port: '',
        pathname: '/assets/images/**',
      }
    ]
  },
  serverRuntimeConfig: {
    maxBodySize: '50mb', // Adjust this value as needed
  },
  async rewrites() {
    return [
      {
        source: '/api/transcribe',
        destination: 'https://api.groq.com/openai/v1/audio/transcriptions',
      },
    ];
  },
}
