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
require('./src/setupBabel');

const fs = require('fs');
const path = require('path');
const commander = require('commander');
const Util = require('./src/utils');
const Parser = require('./src/parser');
const bundle = require('./src/bundler');
const _ = require('lodash');
const {SourceMapConsumer} = require('source-map');

commander
  .description('React Native Bundle Spliter')
  .option('--output <path>', 'Path to store bundle.', 'build')
  .option(
    '--config <path>',
    'Config file for react-native-split.',
    'split.config.js',
  )
  .option('--platform <platform/>', 'Specify bundle platform.', 'ios')
  .option('--dev [boolean]', 'Generate dev module.')
  .parse(process.argv);

if (!commander.config) {
  throw new Error('You must enter an config file (by --config).');
}

function isFileExists(fname) {
  try {
    fs.accessSync(fname, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function getCustomEntries(custom) {
  const result = [];
  _.forEach(custom, (item) => {
    result.push({
      name: item.packageName,
      index: 'node_modules/' + item.packageName + '/index.js',
    });
  });

  return result;
}

const configFile = path.resolve(process.cwd(), commander.config);
const outputDir = path.resolve(process.cwd(), commander.output);

if (!isFileExists(configFile)) {
  console.log('Config file ' + configFile + ' is not exists!');
  process.exit(-1);
}
const rawConfig = require(configFile).default;
const workRoot = path.dirname(configFile);
const outputRoot = path.join(outputDir, 'bundle-output');
Util.ensureFolder(outputRoot);

const config = {
  root: workRoot,
  dev: commander.dev === 'true',
  packageName: rawConfig.package,
  platform: commander.platform,
  outputDir: path.join(outputRoot, 'split'),
  bundleDir: path.join(outputRoot, 'bundle'),
  baseEntry: {
    index: rawConfig.base.index,
    includes: rawConfig.base.includes,
  },
  customEntries: getCustomEntries(rawConfig.custom),
};
if (!isFileExists(config.baseEntry.index)) {
  console.log('Index of base does not exists!');
}

console.log('Work on root: ' + config.root);
console.log('Dev mode: ' + config.dev);
bundle(config, (err, data, sourceMap) => {
  if (err) {
    throw err;
  }
  console.log('===[Bundle] Finish!===');
  SourceMapConsumer.with(sourceMap, null, (consumer) => {
    const parser = new Parser(data, config, consumer);
    parser.splitBundle();
  });
});
