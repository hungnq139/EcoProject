const SCREEN_ENUM = {
  // key : package name
  HomeScreen: {
    pack: require('EcoProject_Home'),
    packageName: 'EcoProject_Home',
    localPath: '../test_home',
  },
  DetailsScreen: {
    pack: require('EcoProject_Details'),
    packageName: 'EcoProject_Details',
    localPath: '../test_details',
  },
};

module.exports = {
  SCREEN_ENUM,
};
