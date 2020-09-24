const SCREEN_ENUM = {
  // key : package name
  HomeScreen: {
    // pack: __DEV__ ? require('EcoProject_Home') : undefined,
    packageName: 'EcoProject_Home',
    localPath: '../../test_home',
  },
  DetailsScreen: {
    // pack: __DEV__ ? require('EcoProject_Details') : undefined,
    packageName: 'EcoProject_Details',
    localPath: '../../test_details',
  },
};

module.exports = {
  SCREEN_ENUM,
};
