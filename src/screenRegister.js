// import RNFetchBlob from 'rn-fetch-blob';

import config from '../split.config';
import {
  getVersionFromGit,
  getVersionFromStorage,
  getDataFromGit,
} from './handleGitProject';

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

    // map git version with store version
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

    // get data from git if version upper
    const arrData = [];
    _.forEach(objVersion, ({gitVersion, storeVersion}, key) => {
      if (gitVersion > storeVersion) {
        arrData.push(getDataFromGit(key));
      }
    });
    const objData = await Promise.all(arrData);
    _.forEach(objData, ([tmp, data]) => {
      data && eval(data);
    });
  } catch (error) {}
  cb && cb();
};

export const downloadResponse = (cb) => {
  _.forEach(config.custom, (item, key) => {
    global[key] = () => null;
  });

  // if (__DEV__) {
  //   setTimeout(() => {
  //     cb && cb();
  //   }, 1000);
  // } else {
  handleBundle(cb);
  // }
};
