rm -rf ./yarn.lock
yarn
node ./splitBundle --platform ios --dev false