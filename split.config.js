const config = {
  package: 'test',
  base: {
    index: './index.js',
    includes: ['./src/*'],
  },
  custom: {
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
  },
};

// let newConfig = {};
// if (__DEV__) {
//   console.info('dc,', __DEV__);
//   const newCustom = {};
//   _.forEach(config.custom, function (obj, key) {
//     newCustom[key] = {
//       pack: require(obj.packageName),
//       packageName: obj.packageName,
//       localPath: obj.localPath,
//     };
//   });
//   newConfig = _.merge(config, {
//     custom: newCustom,
//   });
// }

export default config;
// exports.default = config;
