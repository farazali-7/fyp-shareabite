import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer, useNavigation, DrawerActions } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';


// Import Screens
import Login from "./src/screens/Auth/Login";
import RegisterScreen from "./src/screens/Auth/Register";
import OTPVerificationScreen from "./src/screens/Auth/OtpVerificationScreen";
import SetPasswordScreen from "./src/screens/Auth/SetPassword";
import ForgotPasswordScreen from "./src/screens/Auth/ForgotPassword";
import ResetPasswordScreen from "./src/screens/Auth/ResetPassword";
import DrawerContent from "./src/screens/Resturant/RDrawerContent";


import RHomeScreen from "./src/screens/Resturant/RHome";
import RSearchScreen from "./src/screens/Resturant/RSearch";
import RNotificationScreen from "./src/screens/Resturant/RNotification";
import RProfileScreen from "./src/screens/Resturant/RProfile";
import REditProfileScreen from './src/screens/Resturant/REditProfile';
import RHistoryScreen from './src/screens/Resturant/RHistory';
import TestingScreen from "./src/screens/Resturant/Testin";
import RPost from "./src/screens/Resturant/RPost";







// Stack Navigator for Resturant Screens  navigation
const ResturantStackNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#d27001',
        },
        headerShown: false,
        headerTintColor: '#3d3d3d',
        headerTitleAlign: 'center',
      }}
    >


      <Stack.Screen
        name="Home"
        component={ResturantTabs}
      />
      <Stack.Screen name="Search" component={RSearchScreen} />
      <Stack.Screen name="Notification" component={RNotificationScreen} />
      <Stack.Screen name="Profile" component={RProfileScreen}  
       /* options={({ navigation }) => ({
          headerRight: () => (
            <Ionicons
              name="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              size={30}
              color="#d27001"
            />
          ),
        })}*/ />
      <Stack.Screen name="EditProfile" component={REditProfileScreen} />
      <Stack.Screen name="History" component={RHistoryScreen} />
      <Stack.Screen name="Testing" component={TestingScreen} />
      <Stack.Screen name="NewPost" component={RPost} />

    </Stack.Navigator>
  );
};



const ResturantTabs = () => {
  const Tab = createBottomTabNavigator();

  return (
    //validation of  visibility focused/unfocused
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, //  hiding the header globally for all tabs to prevent the collision of darwer/screen headers
      })}
      initialRouteName="Home">

      <Tab.Screen name="Home" component={RHomeScreen} />
      <Tab.Screen name="Search" component={RSearchScreen} />
      <Tab.Screen name="Notification" component={RNotificationScreen} />
      <Tab.Screen name="Profile" component={ResturantDrawerNavigator} />

    </Tab.Navigator>)
}



// Drawer Navigator for for Resturant Screens
const ResturantDrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0163d2',
        },
        headerShown: true,
      }}>
      <Drawer.Screen name="Profile" component={RProfileScreen} />

    </Drawer.Navigator>
  );
};



//auth satck before login screens
const AuthStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#a14098',
        },
        headerShown: false,
        headerTintColor: '##3d3d3d',
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OtpVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  )
}



export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <AuthStack />
              </NavigationContainer>
    </View>
  );
}
