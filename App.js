/*global HomeScreen, DetailsScreen*/
import React, {useEffect, useState, useCallback} from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {registerGlobalScreen, downloadResponse} from './screenRegister';
registerGlobalScreen();

const Stack = createStackNavigator();

const LoadingComp = () => (
  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
    <Text>Loading</Text>
  </View>
);

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const cb = useCallback(() => {
    setLoading(false);
  }, []);
  useEffect(() => {
    downloadResponse(cb);
    // HomeScreen = require('EcoProject_Home').default;
    // DetailsScreen = require('EcoProject_Details').default;
  }, [cb]);

  if (isLoading) {
    return <LoadingComp />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
