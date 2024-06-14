// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './components/HomeScreen';
import SummarizationScreen from './components/SummarizationScreen';
import SplashScreen from './components/SplashScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="VideoDigest" screenOptions={{headerShown:false}}>
        <Stack.Screen
            name="VideoDigest"
            component={SplashScreen}
            //options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          //options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Summarization"
          component={SummarizationScreen}
         // options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
