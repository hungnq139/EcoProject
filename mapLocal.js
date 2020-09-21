const {execSync} = require('child_process');
const _ = require('lodash');

const {SCREEN_ENUM} = require('./src/screenEnum');

function execShell(command) {
  try {
    const stdout = execSync(command, {stdio: 'inherit'});
    console.log(`stdout: ${stdout}`);
  } catch (error) {
    console.log(`stderr: ${error}`);
    return;
  }
}

let index = 0;
_.forEach(SCREEN_ENUM, function ({packageName, localPath}, key) {
  const modulePath = './node_modules/' + packageName;
  setTimeout(() => {
    execShell(`yarn run wml add ${modulePath} ${localPath}`);
  }, index * 500);
  index = index + 1;
});
