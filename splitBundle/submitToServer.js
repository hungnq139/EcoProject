'use strict';
require('./src/setupBabel');

const axios = require('axios').default;
const _ = require('lodash');
const fs = require('fs');
const config = require('../split.config').default;

function checkFileExists(p) {
  try {
    if (fs.existsSync(p)) {
      //file exists
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
}

function start() {
  _.forEach(config.custom, ({packageName}, key) => {
    const filePath = `./build/bundle-output/split/${packageName}/index.bundle`;
    const hasFile = checkFileExists(filePath);
    if (hasFile) {
      let file_buffer = fs.readFileSync(filePath);
      // eslint-disable-next-line no-undef
      const code = Buffer.from(file_buffer).toString('base64');
      const url = `http://api.github.com/repos/hungnq139/${packageName}/contents/index.bundle`;
      axios
        .get(url)
        .then((info) => {
          const timestamp = new Date().getTime();
          axios
            .put(
              url,
              {
                message: `Jenkins:auto update - ${timestamp}`,
                committer: {
                  name: 'hungnq139',
                  email: 'hungnq139@github.com',
                },
                content: code,
                sha: info.data.sha,
              },
              {
                headers: {
                  Authorization: `token ${config.token}`,
                },
              },
            )
            .then((res) => console.info(url, res))
            .catch((err) => {
              console.info(url, err);
            });
        })
        .catch((err) => console.info(url, err));
    }
  });
}

start();
