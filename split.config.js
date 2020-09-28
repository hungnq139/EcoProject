const config = {
  package: 'test',
  // --token--
  token: '--token--',
  base: {
    index: './index.js',
    includes: ['./src/*'],
  },
  custom: {
    HomeScreen: {
      pack: global.__DEV__ ? require('EcoProject_Home').default : undefined,
      packageName: 'EcoProject_Home',
      localPath: '../../test_home',
    },
    DetailsScreen: {
      pack: global.__DEV__ ? require('EcoProject_Details').default : undefined,
      packageName: 'EcoProject_Details',
      localPath: '../../test_details',
    },
    InfoScreen: {
      pack: global.__DEV__ ? require('ecoproject_info').default : undefined,
      packageName: 'ecoproject_info',
      localPath: '../../test_details',
    },
  },
};

export default config;
