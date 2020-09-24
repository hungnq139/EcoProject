// import RNFetchBlob from 'rn-fetch-blob';

import config from '../split.config';
import {
  getVersionFromGit,
  getVersionFromStorage,
  getDataFromGit,
} from './handleGitProject';

export const registerGlobalScreen = () => {
  global._ = require('lodash');

  _.forEach(config.custom, (item, key) => {
    global[key] = () => null;
  });
};

const handleBundle = async (cb) => {
  try {
    const arrGit = [];
    const arrStorage = [];
    _.forEach(config.custom, ({packageName}) => {
      arrGit.push(getVersionFromGit(packageName));
      arrStorage.push(getVersionFromStorage(packageName));
    });

    const size = _.size(config.custom);
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
  if (__DEV__) {
    setTimeout(() => {
      cb && cb();
    }, 1000);
  } else {
    handleBundle(cb && cb());
  }
};
