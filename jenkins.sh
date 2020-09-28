
if [ ! -d "./build" ]; then
    mkdir build
fi

rm -rf ./yarn.lock
yarn

sed -i "" '/pack: global.__DEV__ ? require/d' split.config.js

node ./splitBundle --platform ios --dev false
node ./splitBundle/submitToServer.js
