const config = {
  package: 'test',
  token: '1154a0ed4d2dac98bef86b424898001a8349a96e',
  base: {
    index: './index.js',
    includes: ['./src/*'],
  },
  custom: {
    HomeScreen: {
      pack: __DEV__ ? require('EcoProject_Home').default : undefined,
      packageName: 'EcoProject_Home',
      localPath: '../../test_home',
    },
    DetailsScreen: {
      pack: __DEV__ ? require('EcoProject_Details').default : undefined,
      packageName: 'EcoProject_Details',
      localPath: '../../test_details',
    },
  },
};

export default config;
