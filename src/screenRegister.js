// import RNFetchBlob from 'rn-fetch-blob';
import React from 'react';

import {View, Text} from 'react-native';
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
    let result = {};
    try {
      result = await Promise.all([...arrGit, ...arrStorage]);
    } catch (error) {
      console.info('error when get verison', error);
    }
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
    let objData = {};
    try {
      objData = await Promise.all(arrData);
    } catch (error) {
      console.info('error when get data', error);
    }
    _.forEach(objData, ([tmp, data]) => {
      data && eval(data);
    });
  } catch (error) {}
  cb && cb();
};

const DefaultView = () => (
  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
    <Text>Chua Load</Text>
  </View>
);

export const downloadResponse = (cb) => {
  _.forEach(config.custom, (item, key) => {
    global[key] = DefaultView;
  });

  if (__DEV__) {
    _.forEach(config.custom, (item, key) => {
      global[key] = item.pack;
    });
    cb && cb();
  } else {
    handleBundle(cb);
  }
};
