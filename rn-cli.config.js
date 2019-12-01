module.exports = {
  getTransformerModulePath: () => {
    return require.resolve('react-native-typescript-transformer');
  },
  getSourceExts: () => {
    return ['ts', 'tsx'];
  },
};
