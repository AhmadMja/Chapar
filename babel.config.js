const presets = [
  [
    '@babel/env',
    {
      // modules: false,
      useBuiltIns: 'usage',
      corejs: 3
    }
  ]
];

// const plugins = ['@babel/plugin-transform-runtime'];
const plugins = [];

module.exports = { presets, plugins };
