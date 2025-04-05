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
import CharityDashboard from "./src/screens/CharityDashboard";
import OTPVerificationScreen from "./src/screens/Auth/OtpVerificationScreen";
import SetPasswordScreen from "./src/screens/Auth/SetPassword";
import ForgotPasswordScreen from "./src/screens/Auth/ForgotPassword";
import ResetPasswordScreen from "./src/screens/Auth/ResetPassword";
import ResturantHomeScreen from "./src/screens/ResturantScreens/ResturantHome";
import ResturantDrawerContent from "./src/screens/ResturantScreens/ResturantDrawerContent";
import ResturantProfile from "./src/screens/ResturantScreens/Profile"
import ResturantContactScreen from './src/screens/ResturantScreens/ContactR'

// Import Icon component (adjust the import based on your icon library)
import Icon from "react-native-vector-icons/MaterialIcons";



const MyTabs = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'ResturantScreen') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'ResturantProfile') {
          iconName = focused ? 'search' : 'search-outline';
        } else if (route.name === 'ResturantContact') {
          iconName = focused ? 'notifications' : 'notifications-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
      headerShown: false, // This hides the header globally for all tabs
    })}
  >
   
  
    
      <Tab.Screen name="ResturantScreen" component={ResturantHomeScreen}  />
      <Tab.Screen name="ResturantProfile" component={ResturantProfile}  />
      <Tab.Screen name="ResturantContact" component={DrawerNavigator} />
    </Tab.Navigator>)
}



// Drawer Navigator for screens that should appear in the drawer
const DrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      drawerContent={props => <ResturantDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          // This will add a margin above the header
          backgroundColor: '#0163d2', // Example background color
        },
        headerShown: true,
      }}>
<Drawer.Screen name="ResturantScreen" component={ResturantHomeScreen} />

    </Drawer.Navigator>
  );
};

// Stack Navigator for overall app navigation
const StackNav = () => {
  const Stack = createNativeStackNavigator();
  const navigation = useNavigation();
  return (
    <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#a14098',
      },
      headerShown: false,
      headerTintColor: '##3d3d3d',
      headerTitleAlign: 'center',
    }}
  >

      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Dashboard" component={DrawerNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="OtpVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />*
      <Stack.Screen
        name="ResturantScreen"
        component={MyTabs}
        options={({ navigation }) => ({ // Correctly access navigation from props
          headerLeft: () => (
            <Icon
              name="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())} // Properly call the drawer open action
              size={30}
              color="#fff"
            />
          )
        })}
      />
      <Stack.Screen name="ResturantProfile" component={ResturantProfile} />
      <Stack.Screen name="ResturantContact" component={ResturantContactScreen} />
    </Stack.Navigator>
  );
};

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
        <MyTabs />
      </NavigationContainer>
    </View>
  );
}
