import {SCREEN_ENUM} from './screenEnum';

export const registerGlobalScreen = () => {
  global._ = require('lodash');

  _.forEach(SCREEN_ENUM, (item, key) => {
    global[key] = () => null;
  });
};

export const downloadResponse = () => {
  if (__DEV__) {
    _.forEach(SCREEN_ENUM, ({pack}, key) => {
      global[key] = pack.default;
    });
  } else {
  }
};
