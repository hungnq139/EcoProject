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

const _ = require('lodash');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const path = require('path');
const minimatch = require('minimatch');
const Util = require('./utils');
const fs = require('fs');
const assetPathUtil = require('./assetPathUtils');
const execSync = require('child_process').execSync;
const colors = require('colors');

const MODULE_SPLITER = '\n';

function getFileName(f) {
  let result = _.split(f, '.');
  let size = _.size(result);

  const newPath = _.join(_.take(result, size - 1), '.');
  result = _.split(newPath, '/');
  size = _.size(result);
  return _.join(_.takeRight(result, size - 1), '/');
}
class Parser {
  _codeBlob;
  _config;
  _useCustomSplit;
  _polyfills;
  _moduleCalls;
  _base;
  _customEntries;
  _baseEntryIndexModule;
  _bundles;
  _modules;

  constructor(codeBlob, config) {
    this._codeBlob = codeBlob;
    this._config = config;
    this._useCustomSplit = typeof config.customEntries !== 'undefined';
    this._modules = {};

    this._polyfills = []; // polyfill codes range, always append on start.
    this._moduleCalls = []; // module call codes range, always append on end.

    this._base = new Set(); // store module id of base modules
    this._customEntries = [];
    this._bundles = []; // store split codes
  }

  splitBundle() {
    const outputDir = this._config.outputDir;
    Util.ensureFolder(outputDir);
    const bundleAST = babylon.parse(this._codeBlob, {
      sourceType: 'script',
      plugins: ['jsx', 'flow'],
    });
    this._parseAST(bundleAST);
    this._doSplit();
    this._bundles.forEach((subBundle) => {
      console.log(('\n====== Split ' + subBundle.name + ' ======').cyan);
      const code = subBundle.codes.join(MODULE_SPLITER);
      const subBundlePath = path.resolve(outputDir, subBundle.name);
      Util.ensureFolder(subBundlePath);

      const codePath = path.resolve(subBundlePath, 'index.bundle');
      fs.writeFileSync(codePath, code);
      console.log('[Code] Write code to ' + codePath);
      if (subBundle.assetRenames) {
        subBundle.assetRenames.forEach((item) => {
          const assetNewDir = path.dirname(item.newPath);
          Util.mkdirsSync(assetNewDir);
          console.log(
            '[Resource] Move resource ' +
              item.originPath +
              ' to ' +
              item.newPath,
          );
          fs.createReadStream(item.originPath).pipe(
            fs.createWriteStream(item.newPath),
          );
        });
      }
      console.log(('====== Split ' + subBundle.name + ' done! ======').cyan);
    });
  }

  _parseAST(bundleAST) {
    const program = bundleAST.program;
    const body = program.body;
    const customBase = [];
    const customEntry = [];
    let reactEntryModule;
    let moduleCount = 0;
    body.forEach((node) => {
      if (Util.isEmptyStmt(node)) {
        return;
      }

      let {start, end} = node;

      if (Util.isPolyfillCall(node, this._config.dev)) {
        // push polyfill codes to base.
        this._polyfills.push({start, end});
      } else if (Util.isModuleCall(node)) {
        this._moduleCalls.push({start, end});
      } else if (Util.isModuleDeclaration(node)) {
        moduleCount++;
        const args = node.expression.arguments;
        const moduleId = parseInt(args[1].value);
        const moduleName = args[3].value;
        const module = {
          id: moduleId,
          name: moduleName,
          dependencies: this._getModuleDependency(args[2]),
          code: {start, end},
          idCodeRange: {
            start: args[1].start - node.start,
            end: args[1].end - node.start,
          },
        };

        if (Util.isAssetModule(moduleName)) {
          module.isAsset = true;
          module.assetConfig = Object.assign({}, Util.getAssetConfig(node), {
            moduleId,
          });
          // console.log('Get asset module ' + moduleName, module.assetConfig);
          console.log('Get asset module ' + moduleName);
        }

        if (!reactEntryModule && Util.isReactNativeEntry(moduleName)) {
          // get react native entry, then init base set.
          reactEntryModule = moduleId;
        }

        if (this._isBaseEntryModule(module)) {
          console.info('Get base entry module: '.cyan + moduleName);
          this._baseEntryIndexModule = moduleId;
        } else if (this._isCustomBaseModule(module)) {
          console.info('Get custom base '.cyan + moduleName);
          customBase.push(moduleId);
        } else if (this._useCustomSplit) {
          let entry = this._isCustomEntryModule(module);
          if (entry) {
            console.info('Get custom entry '.cyan + moduleName);
            customEntry.push({
              id: moduleId,
              name: entry.name,
            });
          }
        }

        this._modules[moduleId] = module;
        // console.log(
        //   'Module ' +
        //     moduleName +
        //     '(' +
        //     moduleId +
        //     ') dependency:' +
        //     JSON.stringify(module.dependencies),
        // );
      } else {
        // console.log(require('util').inspect(node, false, null));
        console.warn(
          'Cannot parse node!'.yellow,
          this._codeBlob.substring(node.start, node.end),
        );
      }
    });

    // generate react-native based module firstly.
    if (reactEntryModule) {
      this._genBaseModules(reactEntryModule);
    } else {
      console.warn(
        "Cannot find react-native entry module! You should require('react-native') at some entry."
          .yellow,
      );
    }

    // append custom base modules.
    customBase.forEach((base) => {
      this._genBaseModules(base);
    });

    if (typeof this._baseEntryIndexModule !== 'undefined') {
      let module = this._modules[this._baseEntryIndexModule];
      let dependency = module.dependencies;
      for (let i = dependency.length - 1; i >= 0; i--) {
        if (customEntry.find((item) => item.id === dependency[i])) {
          dependency.splice(i, 1);
        }
      }
      this._genBaseModules(this._baseEntryIndexModule);
    }

    if (customEntry) {
      // after gen base module, generate custom entry sets.
      customEntry.forEach((entry) => {
        this._genCustomEntryModules(entry.name, entry.id);
      });
    }

    // console.log('Get polyfills', this._polyfills);
    console.log('Total modules :' + moduleCount);
    console.log('Base modules size: ' + this._base.size);
  }

  _genBaseModules(moduleId) {
    this._base.add(moduleId);
    const module = this._modules[moduleId];
    const queue = module.dependencies;

    if (!queue) {
      return;
    }
    let added = 0;
    while (queue.length > 0) {
      const tmp = queue.shift();

      if (this._base.has(tmp)) {
        continue;
      }

      if (
        this._modules[tmp].dependencies &&
        this._modules[tmp].dependencies.length > 0
      ) {
        this._modules[tmp].dependencies.forEach((dep) => {
          if (!this._base.has(dep)) {
            queue.push(dep);
          }
        });
      }
      added++;
      this._base.add(tmp);
    }
    console.log(
      '\nModule '.cyan +
        module.name +
        ' added to base (' +
        added +
        ' more dependency added too)',
    );
  }

  _genCustomEntryModules(name, moduleId) {
    const set = new Set();
    set.add(moduleId);

    const module = this._modules[moduleId];
    const queue = module.dependencies;

    if (!queue) {
      return;
    }
    let added = 0;
    while (queue.length > 0) {
      const tmp = queue.shift();

      if (set.has(tmp) || this._base.has(tmp)) {
        continue;
      }

      const dependency = this._modules[tmp].dependencies;
      if (dependency && dependency.length > 0) {
        dependency.forEach((dep) => {
          if (!this._base.has(dep) && !set.has(dep)) {
            queue.push(dep);
          }
        });
      }
      added++;
      set.add(tmp);
    }
    this._customEntries.push({
      moduleId,
      name,
      moduleSet: set,
    });
    console.log(
      '\nModule '.cyan +
        module.name +
        ' added to bundle ' +
        name +
        '. (' +
        added +
        ' more dependency added too)',
    );
  }

  _getModuleDependency(dependencyNode) {
    if (dependencyNode.type === 'ArrayExpression') {
      let {start, end} = dependencyNode;
      return Util.getModuleDependency(this._codeBlob, start, end);
    }
    return [];
  }

  _isBaseEntryModule(module) {
    const baseIndex = this._config.baseEntry.index;
    const indexGlob = getFileName(baseIndex) + '.tmp.js';
    // base index entry.
    return minimatch(module.name, indexGlob);
  }

  _isCustomEntryModule(module) {
    return this._config.customEntries.find((entry) => {
      const pathGlob = entry.index;
      return minimatch(module.name, pathGlob);
    });
  }

  _isCustomBaseModule(module) {
    if (
      this._config.baseEntry.includes &&
      this._config.baseEntry.includes.length > 0
    ) {
      const includes = this._config.baseEntry.includes;
      const match = includes.find((glob) => {
        const pathGlob = glob;
        return minimatch(module.name, pathGlob);
      });
      return typeof match !== 'undefined';
    }
    return false;
  }

  _getAssetRenames(asset, bundle) {
    const assetRenames = [];
    if (this._config.platform === 'android') {
      console.log('Get asset renames', asset);
      assetPathUtil
        .getAssetPathInDrawableFolder(asset)
        .forEach((relativePath) => {
          assetRenames.push({
            originPath: path.resolve(this._config.bundleDir, relativePath),
            relativePath: relativePath,
            newPath: path.resolve(this._config.outputDir, bundle, relativePath),
          });
        });
    } else {
      console.log('Get ios asset renames', asset);
      asset.scales.forEach((scale) => {
        const relativePath = this._getAssetDestPathIOS(asset, scale);
        const originPath = path.resolve(this._config.bundleDir, relativePath);
        if (Util.ensureFolder(originPath)) {
          assetRenames.push({
            originPath,
            relativePath: relativePath,
            newPath: path.resolve(this._config.outputDir, bundle, relativePath),
          });
        }
      });
    }

    return assetRenames;
  }

  _getAssetDestPathIOS(asset, scale) {
    const suffix = scale === 1 ? '' : '@' + scale + 'x';
    const fileName = asset.name + suffix + '.' + asset.type;
    return path.join(asset.httpServerLocation.substr(1), fileName);
  }

  _doSplit() {
    // this._splitBase();

    if (this._useCustomSplit) {
      this._customEntries.forEach((entry, index) => {
        this._splitCustomEntry(entry, index);
      });
      console.log('Use custom split');
    } else {
      this._splitNonBaseModules();
    }
  }

  _splitBase() {
    let cmd = 'react-native bundle';
    cmd += ' --entry-file ' + this._config.baseEntry.index;
    cmd += ' --bundle-output ' + 'tmp.bundle';
    cmd += ' --assets-dest ' + this._config.bundleDir;
    cmd += ' --platform ' + this._config.platform;
    cmd += ' --dev ' + this._config.dev;
    try {
      execSync(cmd, {stdio: 'inherit'});
      const code = fs.readFileSync('tmp.bundle', 'utf-8');
      this._bundles.push({
        name: 'base',
        codes: [code],
      });
      execSync('rm -rf tmp.bundle', {stdio: 'inherit'});
    } catch (error) {}
  }

  _splitCustomEntry(entry, index) {
    const bundleName = entry.name;
    let codes = [];
    let assetRenames = [];
    const upperIndex = index + 1 + '0';
    entry.moduleSet.forEach((moduleId) => {
      const module = this._modules[moduleId];
      let code = this._codeBlob.substring(module.code.start, module.code.end);
      code =
        code.substring(0, module.idCodeRange.start) +
        upperIndex +
        module.id +
        code.substring(module.idCodeRange.end);
      if (module.isAsset && module.assetConfig) {
        assetRenames = assetRenames.concat(
          this._getAssetRenames(module.assetConfig, bundleName),
        );
        code = this._addBundleToAsset(module, bundleName, code);
      }
      code = Util.replaceModuleIdWithName(code, this._modules);
      codes.push(code);
    });
    // let entryModuleName = this._modules[entry.moduleId].name;
    codes.push('\n__r(' + upperIndex + entry.moduleId + ');');
    this._bundles.push({
      name: bundleName,
      codes,
      assetRenames,
    });
  }

  _splitNonBaseModules() {
    const bundleName = 'business';
    let codes = [];
    let assetRenames = [];
    for (let moduleId in this._modules) {
      let moduleIdInt = parseInt(moduleId);

      if (
        this._modules.hasOwnProperty(moduleId) &&
        !this._base.has(moduleIdInt)
      ) {
        const module = this._modules[moduleIdInt];
        let code = this._codeBlob.substring(module.code.start, module.code.end);
        code =
          code.substring(0, module.idCodeRange.start) +
          '"' +
          module.name +
          '"' +
          code.substring(module.idCodeRange.end);
        if (module.isAsset && module.assetConfig) {
          assetRenames = this._getAssetRenames(module.assetConfig, bundleName);
          code = this._addBundleToAsset(module, bundleName, code);
        }
        code = Util.replaceModuleIdWithName(code, this._modules);
        codes.push(code);
      }
    }
    this._bundles.push({
      name: bundleName,
      codes,
      assetRenames,
    });
  }

  _addBundleToAsset(module, bundleName, code) {
    const asset = module.assetConfig;
    let startInner = asset.code.start - module.code.start;
    let endInner = asset.code.end - module.code.start;
    return (
      code.substring(0, startInner) +
      JSON.stringify({
        httpServerLocation: asset.httpServerLocation,
        width: asset.width,
        height: asset.height,
        scales: asset.scales,
        hash: asset.hash,
        name: asset.name,
        type: asset.type,
        bundle: bundleName,
      }) +
      code.substring(endInner)
    );
  }
}

module.exports = Parser;
