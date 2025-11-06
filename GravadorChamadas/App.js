import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CallList from './components/CallList';
import Settings from './components/Settings';
import PermissionGate from './components/PermissionGate';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PermissionGate>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Gravações') {
                iconName = focused ? 'recording' : 'recording-outline';
              } else if (route.name === 'Configurações') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'red',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Gravações" component={CallList} />
          <Tab.Screen name="Configurações" component={Settings} />
        </Tab.Navigator>
      </NavigationContainer>
    </PermissionGate>
  );
}