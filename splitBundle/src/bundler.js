/**
 * Copyright 2015-present Desmond Yao
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Created by desmond on 4/16/17.
 * @flow
 */
'use strict';
const _ = require('lodash');
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const Util = require('./utils');
const UglifyJS = require('uglify-js');

const DEV_REGEX = /global\.__DEV__\s?=\s?true/;
const DEV_FALSE = 'global.__DEV__ = false';

function getFileName(f) {
  const result = _.split(f, '.');
  const size = _.size(result);
  return _.join(_.take(result, size - 1), '.');
}

function injectCodesToBase(config) {
  let entryInject = '\n';
  config.customEntries.forEach((entry) => {
    if (entry.inject === false) {
      return;
    }
    let indexModule = path.resolve(config.root, entry.index);
    entryInject += "require('" + indexModule + "');\n";
  });
  let tmpEntry = path.resolve(
    config.root,
    getFileName(config.baseEntry.index) + '.tmp.js',
  );
  if (fs.existsSync(tmpEntry)) {
    fs.unlinkSync(tmpEntry);
  }
  let originData = fs.readFileSync(config.baseEntry.index, 'utf-8');
  originData += entryInject;
  fs.writeFileSync(tmpEntry, originData);
  return tmpEntry;
}

function bundle(config, callback) {
  Util.ensureFolder(config.bundleDir);

  const tmpBase = injectCodesToBase(config);
  const bundlePath = path.resolve(config.bundleDir, 'index.bundle');
  const sourceMapPath = path.resolve(config.bundleDir, 'index.map');

  let cmd = 'react-native bundle';
  cmd += ' --entry-file ' + tmpBase;
  cmd += ' --bundle-output ' + bundlePath;
  cmd += ' --assets-dest ' + config.bundleDir;
  cmd += ' --platform ' + config.platform;
  cmd += ' --sourcemap-output ' + sourceMapPath;
  cmd += ' --dev false';

  console.log('===[Bundle] Start!===');
  console.log(cmd);
  exec(cmd, (error) => {
    if (error) {
      callback(error);
    }
    const code = fs.readFileSync(bundlePath, 'utf-8');
    let sourceMap = fs.readFileSync(sourceMapPath, 'utf-8');

    callback(error, code, sourceMap);
    fs.unlinkSync(tmpBase);
  }).stdout.pipe(process.stdout);
}

module.exports = bundle;
