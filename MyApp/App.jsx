import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from '@react-navigation/drawer'
// Import Screens
import Login from "./src/screens/Auth/Login";
import RegisterScreen from "./src/screens/Auth/Register";
import CharityDashboard from "./src/screens/CharityDashboard";
// Create Stack Navigator

const StackNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#007bff" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      {/* Home Screen with Navigation Buttons */}
      <Stack.Screen name="Charity" component={CharityDashboard} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={Login} />

    </Stack.Navigator>
  )
}

export default function App() {
  const Drawer = createDrawerNavigator();


  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Charity" component={CharityDashboard}  />
        <Drawer.Screen name="Register" component={RegisterScreen}  />
        {/*<Drawer.Screen name="Login" component={ForgotPasswordScreen}  />*/}
        <Drawer.Screen name="OTp" component={CharityDashboard}  />

      </Drawer.Navigator>
    </NavigationContainer> 

  );
}


















