const config = {
  package: 'test',
  token: '--token--',
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
