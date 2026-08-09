// No native module under Jest — just a passthrough component stub.
const React = require('react');
const { View } = require('react-native');

const WebView = React.forwardRef((props, ref) => React.createElement(View, { ref, testID: 'mock-webview' }));

module.exports = { WebView };
