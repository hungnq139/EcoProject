import AsyncStorage from '@react-native-community/async-storage';
import config from '../../split.config';

export const getVersionFromStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return [key, value || '0'];
  } catch (e) {
    return [key, '0'];
    // saving error
  }
};

export const getVersionFromGit = (project) => {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();

    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        const {tag_name: tagName} = JSON.parse(request.responseText);
        resolve([project, tagName]);
      } else {
        console.info(project, 'response status : ' + request.status);
        reject([project, 'error']);
      }
    };

    request.open(
      'GET',
      `https://api.github.com/repos/hungnq139/${project}/releases/latest`,
    );
    request.setRequestHeader('Authorization', `token ${config.token}`);
    request.send();
  });
};

export const getDataFromGit = (project) => {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();

    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }

      if (request.status === 200) {
        resolve([project, request.responseText]);
      } else {
        reject([project, 'error']);
      }
    };

    request.open(
      'GET',
      `https://api.github.com/repos/hungnq139/${project}/contents/index.bundle`,
    );
    request.setRequestHeader('Authorization', `token ${config.token}`);
    request.setRequestHeader('Accept', 'application/vnd.github.v3.raw');

    request.send();
  });
};

// 6aef7823fcaae62c32a687224b55f36ff794b037
