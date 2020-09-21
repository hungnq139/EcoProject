/**
 * @format
 */
// __DEV__ = false;
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

global._ = require('lodash');

AppRegistry.registerComponent(appName, () => App);

// if (!__DEV__) {
// require('./node_modules/EcoProject_Home/index').default;
// require('./node_modules/EcoProject_Details/index').default;
// }

require('/Users/quang-hung.nguyen/Quant-Edge/test/node_modules/EcoProject_Home/index.js');
require('/Users/quang-hung.nguyen/Quant-Edge/test/node_modules/EcoProject_Details/index.js');
