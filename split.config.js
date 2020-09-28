if (!global.__DEV__) {
  global.__DEV__ === false;
}

const config = {
  package: 'test',
  token: 'e54370694c8fdc0d173ac11e45a36a68fc40b896',
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
  },
};

export default config;
