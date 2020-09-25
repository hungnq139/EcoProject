const config = {
  package: 'test',
  token: '908a6929664c8d00e95b2fd1e4b030af5edbae11',
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
