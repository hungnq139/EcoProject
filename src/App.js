import React, {useEffect, useState, useCallback} from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {downloadResponse} from './screenRegister';

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
  }, [cb]);

  if (isLoading) {
    return <LoadingComp />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={global.HomeScreen} />
        <Stack.Screen name="Detail" component={global.DetailsScreen} />
        <Stack.Screen name="Info" component={global.InfoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
