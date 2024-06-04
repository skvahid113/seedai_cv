import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Launch from './lauch';
import Home from './home';
import Diagnose from './diagnose';
import Mycompost from './mycompost';
import More from './more';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E4B5A',
        tabBarInactiveTintColor: '#dddddd',
        tabBarStyle: { backgroundColor: '#269F72', display: 'flex' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} 
            />
          ),
          headerShown: false, 
        }}
      />
      <Tab.Screen
        name="Diagnose"
        component={Diagnose}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="test-tube" color={color} size={size}
             />
          ),
          headerShown: false, 
        }}
      />
      <Tab.Screen
        name="Mycompost"
        component={Mycompost}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="flower" color={color} size={size} />
          ),
          headerShown: false, 
        }}
      />
      <Tab.Screen
        name="More"
        component={More}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dots-horizontal" color={color} size={size} />
          ),
          headerShown: false, 
        }}
      />
    </Tab.Navigator>
  );
}


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Launch"
        screenOptions={{ headerShown: false }} // Hide header globally for all screens
      >
        <Stack.Screen 
          name="Launch" 
          component={Launch} 
          options={{ headerShown: false }} // Hide header for Launch screen
        />
        <Stack.Screen 
          name="Home" 
          component={HomeTabs} 
          options={{ 
            headerShown: false, // Hide header for Home screen
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}




