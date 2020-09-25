rm -rf ./yarn.lock
yarn
node ./splitBundle --platform ios --dev false

if [ ! -d "./build" ]; then
    mkdir build
fi