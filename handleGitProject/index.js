import AsyncStorage from '@react-native-community/async-storage';

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
        reject([project, 'error']);
      }
    };

    request.open(
      'GET',
      `https://api.github.com/repos/hungnq139/${project}/releases/latest`,
    );
    request.setRequestHeader(
      'Authorization',
      'token dcc6056af1972a9b571f7318a635d29deaf02229',
    );
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
        resolve(request.responseText);
        // const {tag_name: tagName} = JSON.parse(request.responseText);
        // resolve([project, tagName]);
      } else {
        reject('error');

        // reject([project, 'error']);
      }
    };

    request.open(
      'GET',
      `https://api.github.com/repos/hungnq139/${project}/contents/index.js`,
    );
    request.setRequestHeader(
      'Authorization',
      'token dcc6056af1972a9b571f7318a635d29deaf02229',
    );
    request.setRequestHeader('Accept', 'application/vnd.github.v3.raw');

    request.send();
  });
};
