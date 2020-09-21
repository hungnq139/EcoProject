// import RNFetchBlob from 'rn-fetch-blob';

import {SCREEN_ENUM} from './screenEnum';
import {
  getVersionFromGit,
  getVersionFromStorage,
  getDataFromGit,
} from './handleGitProject';
// const dirs = RNFetchBlob.fs.dirs;

export const registerGlobalScreen = () => {
  global._ = require('lodash');

  _.forEach(SCREEN_ENUM, (item, key) => {
    global[key] = () => null;
  });
};

const handleBundle = async (cb) => {
  try {
    const arrGit = [];
    const arrStorage = [];
    _.forEach(SCREEN_ENUM, ({packageName}, key) => {
      arrGit.push(getVersionFromGit(packageName));
      arrStorage.push(getVersionFromStorage(packageName));
    });

    const size = _.size(SCREEN_ENUM);
    const result = await Promise.all([...arrGit, ...arrStorage]);

    const objVersion = {};
    for (let i = 0; i < size; i++) {
      const [keyGit, gitVersion] = result[i];
      if (!objVersion[keyGit]) {
        objVersion[keyGit] = {};
      }
      objVersion[keyGit].gitVersion = gitVersion;

      const [keyStore, storeVersion] = result[i + size];
      if (!objVersion[keyStore]) {
        objVersion[keyStore] = {};
      }
      objVersion[keyStore].storeVersion = storeVersion;
    }

    _.forEach(objVersion, ({gitVersion, storeVersion}, key) => {
      if (gitVersion > storeVersion) {
        getDataFromGit(key);
      }
    });
  } catch (error) {}
  cb && cb();
};

export const downloadResponse = (cb) => {
  // handleBundle();
  if (__DEV__) {
    // _.forEach(SCREEN_ENUM, ({pack}, key) => {
    // pack && (global[key] = pack.default);
    // });
    setTimeout(() => {
      cb && cb();
    }, 1000);
  } else {
    handleBundle(cb && cb());
  }
};
