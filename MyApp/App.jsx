import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import RDrawerContent from "./src/screens/Resturant/RDrawerContent";

//Restaurant Screens
import RHomeScreen from "./src/screens/Resturant/RHome";
import RSearchScreen from "./src/screens/Resturant/RSearch";
import RNotificationScreen from "./src/screens/Resturant/RNotification";
import RProfileScreen from "./src/screens/Resturant/RProfile";
import REditProfileScreen from './src/screens/Resturant/REditProfile';
import RHistoryScreen from './src/screens/Resturant/RHistory';
import TestingScreen from "./src/screens/Resturant/Testin";
import RPost from "./src/screens/Resturant/RPost";

//Charity Screens
import CSearchScreen from "./src/screens/Charity/CSearch";
import CNotificationScreen from "./src/screens/Charity/CNotification";
import CProfileScreen from "./src/screens/Charity/CProfile";
import CEditProfileScreen from "./src/screens/Charity/CEditProfile";
import CHistoryScreen from "./src/screens/Charity/CHistory";
import CHomeScreen from "./src/screens/Charity/CHome";
import CDrawerContent from "./src/screens/Charity/CDrawerContent";

//Admin Screeens



// Stack Navigator for Resturant Screen
const ResturantStackNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={ResturantTabs} />
      <Stack.Screen name="Search" component={RSearchScreen} />
      <Stack.Screen name="Notification" component={RNotificationScreen} />
      <Stack.Screen name="Profile" component={RProfileScreen} />
      <Stack.Screen name="EditProfile" component={REditProfileScreen} />
      <Stack.Screen name="History" component={RHistoryScreen} />
      <Stack.Screen name="Testing" component={TestingScreen} />
      <Stack.Screen name="NewPost" component={RPost} />
    </Stack.Navigator>
  );
};


//Restaurant Bottom Tab Navigator
const ResturantTabs = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
        else if (route.name === 'Notification') iconName = focused ? 'notifications' : 'notifications-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
    initialRouteName="Home">
      <Tab.Screen name="Home" component={RHomeScreen} />
      <Tab.Screen name="Search" component={RSearchScreen} />
      <Tab.Screen name="Notification" component={RNotificationScreen} />
      <Tab.Screen name="Profile" component={ResturantDrawerNavigator} />
    </Tab.Navigator>
  );
};

//Restaurant Drawer Navigator
const ResturantDrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator drawerContent={props => <RDrawerContent {...props} />} screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Profile" component={RProfileScreen} />
    </Drawer.Navigator>
  );
};


//Admin 
const AdminScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>AdminStack</Text></View>;


//Charity Stack Screens 
const CharityStack = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={CharityTabs} />
      <Stack.Screen name="Search" component={CSearchScreen} />
      <Stack.Screen name="Notification" component={CNotificationScreen} />
      <Stack.Screen name="Profile" component={CProfileScreen} />
      <Stack.Screen name="EditProfile" component={CEditProfileScreen} />
      <Stack.Screen name="History" component={CHistoryScreen} />
    </Stack.Navigator>
  );
};

//Charity Bottom Tab Navigator
const CharityTabs = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
        else if (route.name === 'Notification') iconName = focused ? 'notifications' : 'notifications-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
    initialRouteName="Home">
      <Tab.Screen name="Home" component={CHomeScreen} />
      <Tab.Screen name="Search" component={CSearchScreen} />
      <Tab.Screen name="Notification" component={CNotificationScreen} />
      <Tab.Screen name="Profile" component={CharityDrawerNavigator} />
    </Tab.Navigator>
  );
};

//Charity Drawer Navigator
const CharityDrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator drawerContent={props => <CDrawerContent {...props} />} screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Profile" component={CProfileScreen} />
    </Drawer.Navigator>
  );
};



// Auth Stack
const AuthStack = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OtpVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

// Now Root Stack which manages Auth, Admin, Resturant, Charity
const RootStack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('AuthStack');

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();

        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');

        if (token && user) {
          const parsedUser = JSON.parse(user);

          if (parsedUser.role === 'admin') {
            setInitialRoute('AdminStack');
          } else if (parsedUser.role === 'resturant') {
            setInitialRoute('ResturantStackNav');
          } else if (parsedUser.role === 'charity') {
            setInitialRoute('CharityStack');
          } else {
            setInitialRoute('AuthStack');
          }
        } else {
          setInitialRoute('AuthStack');
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
        setInitialRoute('AuthStack');
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

  if (!appIsReady || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
          <RootStack.Screen name="AuthStack" component={AuthStack} />
          <RootStack.Screen name="AdminStack" component={AdminScreen} />
          <RootStack.Screen name="ResturantStackNav" component={ResturantStackNav} />
          <RootStack.Screen name="CharityStack" component={CharityStack} />
        </RootStack.Navigator>
      </NavigationContainer>
    </View>
  );
}
