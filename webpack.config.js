const path = require('path');
const fs = require('fs');

class ObsidianPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tap('ObsidianPlugin', () => {
      const packageData = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf8'));
      
      const manifest = {
        id: packageData.name,
        name: "Canvas2Mermaid",
        version: packageData.version,
        minAppVersion: "1.8.0",
        description: packageData.description,
        author: packageData.author,
        authorUrl: "https://github.com/HaclkMans",
        isDesktopOnly: true
      };
      
      fs.writeFileSync(path.resolve(__dirname, './manifest.json'), JSON.stringify(manifest, null, '\t'));

      const versionsPath = path.resolve(__dirname, './versions.json');
      const versions = fs.existsSync(versionsPath) 
        ? JSON.parse(fs.readFileSync(versionsPath, 'utf8'))
        : {};
      versions[packageData.version] = manifest.minAppVersion;
      fs.writeFileSync(versionsPath, JSON.stringify(versions, null, '\t'));
    });
  }
}

module.exports = {
  target: 'node',
  mode: process.env.BUILD_MODE || 'production',
  entry: './src/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './'),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  externals: {
    'obsidian': 'commonjs obsidian'
  },
  devtool: process.env.BUILD_MODE === 'development' ? 'inline-source-map' : false,
  plugins: [new ObsidianPlugin()]
};