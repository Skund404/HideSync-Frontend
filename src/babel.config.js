module.exports = {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-typescript', { allowNamespaces: true }], // Added allowNamespaces option
      '@babel/preset-react'
    ],
    plugins: [
      '@babel/plugin-transform-typescript'
    ]
  };