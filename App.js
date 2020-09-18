/*global HomeScreen, DetailsScreen*/
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

global.HomeScreen = () => null;
global.DetailsScreen = () => null;

const Stack = createStackNavigator();

const LoadingComp = () => (
  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
    <Text>Loading</Text>
  </View>
);

const App = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    HomeScreen = require();
    DetailsScreen = require();

    setLoading(false);
  }, []);

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
