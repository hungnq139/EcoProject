'use strict';
require('./src/setupBabel');

const _ = require('lodash');
const fs = require('fs');
const config = require('../split.config').default;
const execSync = require('child_process').execSync;

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

function checkPathExists(p) {
  try {
    fs.accessSync(p, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function start() {
  _.forEach(config.custom, ({packageName}, key) => {
    const filePath = `./build/bundle-output/split/${packageName}/index.bundle`;
    const hasFile = checkFileExists(filePath);

    const projectPath = `./../${packageName}`;
    const hasPath = checkPathExists(projectPath);
    if (hasPath && hasFile) {
      execSync(`cp -R ${filePath} ${projectPath}`, {stdio: 'inherit'});
    }
  });
}

start();
