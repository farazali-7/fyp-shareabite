import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SocketProvider } from "./src/context/SocketContext";

// Auth Screens
import Login from "./src/screens/Auth/Login";
import RegisterScreen from "./src/screens/Auth/Register";
import OTPVerificationScreen from "./src/screens/Auth/OtpVerificationScreen";
import SetPasswordScreen from "./src/screens/Auth/SetPassword";
import ForgotPasswordScreen from "./src/screens/Auth/ForgotPassword";
import ResetPasswordScreen from "./src/screens/Auth/ResetPassword";

// Admin Stack
import AdminDashboard from "./src/screens/Admin/AdminDashboard";
import ApprovalSuccess from "./src/screens/Admin/ApprovalSuccess";
import LicenseDetailModal from "./src/screens/Admin/LicenseDetailModal";
import RejectionFlow from "./src/screens/Admin/RejectionFlow";
import AdminDrawerContent from "./src/screens/Admin/AdminDrawerContent";

// Restaurant Screens
import RHomeScreen from "./src/screens/Resturant/RHome";
import RSearchScreen from "./src/screens/Resturant/RSearch";
import RNotificationScreen from "./src/screens/Resturant/RNotification";
import RProfileScreen from "./src/screens/Resturant/RProfile";
import REditProfileScreen from "./src/screens/Resturant/REditProfile";
import RHistoryScreen from "./src/screens/Resturant/RHistory";
import RPost from "./src/screens/Resturant/RPost";
import RDrawerContent from "./src/screens/Resturant/RDrawerContent";
import EditPostScreen from "./src/screens/Resturant/REditPostScreen";
import RViewProfileDetails from "./src/screens/Resturant/RViewProfileDetails";
import RSearchViewProfileScreen from "./src/screens/Resturant/RSearchViewProfile";
import RChatListScreen from "./src/screens/Resturant/RChatScreens/RChatListScreen";
import RChatScreen from "./src/screens/Resturant/RChatScreens/RChatScreen";
import RSearchUsersScreen from "./src/screens/Resturant/RChatScreens/RSearchUsersScreen";

// Status Screens
import UserPendingScreen from "./src/screens/valid/UserPendingScreen";
import RejectionNoticeScreen from "./src/screens/valid/RejectionNoticeScreen";

// Charity Screens
import CHomeScreen from "./src/screens/Charity/CHome";
import CSearchScreen from "./src/screens/Charity/CSearch";
import CNotificationScreen from "./src/screens/Charity/CNotification";
import CProfileScreen from "./src/screens/Charity/CProfile";
import CEditProfileScreen from "./src/screens/Charity/CEditProfile";
import CHistoryScreen from "./src/screens/Charity/CHistory";
import CDrawerContent from "./src/screens/Charity/CDrawerContent";
import CSearchViewProfileScreen from "./src/screens/Charity/CSearchViewProfile";
import RContactUsScreen from "./src/screens/Resturant/RContactFile";
import CChatListScreen from "./src/screens/Charity/CChatScreens/CChatListScreen";
import CSearchUsersScreen from "./src/screens/Charity/CChatScreens/CSearchUsersScreen";
import CChatScreen from "./src/screens/Charity/CChatScreens/CChatScreen";

const AdminStack = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDrawerNavigator} />
      <Stack.Screen name="LicenseDetailModal" component={LicenseDetailModal} />
      <Stack.Screen name="RejectionFlow" component={RejectionFlow} />
      <Stack.Screen name="ApprovalSuccess" component={ApprovalSuccess} />
    </Stack.Navigator>
  );
};

const AdminDrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator drawerContent={(props) => <AdminDrawerContent {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="AdminDashboard" component={AdminDashboard} />
    </Drawer.Navigator>
  );
};

const RestaurantStackNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={RestaurantTabs} />
      <Stack.Screen name="Search" component={RSearchScreen} />
      <Stack.Screen name="Notification" component={RNotificationScreen} />
      <Stack.Screen name="Profile" component={RProfileScreen} />
      <Stack.Screen name="EditPostScreen" component={EditPostScreen} />
      <Stack.Screen name="ViewProfileDetails" component={RViewProfileDetails} />
      <Stack.Screen name="SearchViewProfileScreen" component={RSearchViewProfileScreen} />
      <Stack.Screen name="EditProfile" component={REditProfileScreen} />
      <Stack.Screen name="History" component={RHistoryScreen} />
      <Stack.Screen name="NewPost" component={RPost} />
      <Stack.Screen name="ContactUs" component={RContactUsScreen} />
      <Stack.Screen name="RestaurantChatList" component={RChatListScreen} />
      <Stack.Screen name="RestaurantChat" component={RChatScreen} />
      <Stack.Screen name="RestaurantChatSearch" component={RSearchUsersScreen} />
    </Stack.Navigator>
  );
};

const RestaurantTabs = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Notification') iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: '#356F59',
          height: 60,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 3,
          borderRadius: 20,
          marginHorizontal: 1,
          marginBottom: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        headerShown: false,
      })}
    >


      <Tab.Screen
        name="Home"
        component={RHomeScreen}
        options={{
          headerTitle: "EATRY HOME",
          headerShown: true,
          headerStyle: {
            paddingTop: 0,
            backgroundColor: '#356F59',
            borderBottomWidth: 0,
            height: 90,

          },
          headerTitleStyle: {
            color: 'white',
            fontWeight: '600',
            fontSize: 25,
            fontFamily: 'System',
            textTransform: 'capitalize',
            letterSpacing: 0.2,
          },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerRightContainerStyle: {
            paddingRight: 1,
          },
          headerTitleContainerStyle: {
            paddingBottom: 8,
          },

        }}
      />

      <Tab.Screen name="Search" component={RSearchScreen} />
      <Tab.Screen name="Notification" component={RNotificationScreen} />
      <Tab.Screen name="Profile" component={RestaurantDrawerNavigator} />
    </Tab.Navigator>
  );
};

const RestaurantDrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator   screenOptions={{ headerShown: false }}

    drawerContent={(props) => <RDrawerContent {...props} />} >
      <Drawer.Screen name="Profile" component={RProfileScreen} />
    </Drawer.Navigator>
    
  );
};

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
      <Stack.Screen name="SearchViewProfileScreen" component={CSearchViewProfileScreen} />
      <Stack.Screen name="CharityChatList" component={CChatListScreen} />
      <Stack.Screen name="CharityChat" component={CChatScreen} />
      <Stack.Screen name="CharityChatSearch" component={CSearchUsersScreen} />
    </Stack.Navigator>
  );
};

const CharityTabs = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Search") iconName = focused ? "search" : "search-outline";
          else if (route.name === "Notification") iconName = focused ? "notifications" : "notifications-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: '#356F59',
          height: 60,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 3,
          borderRadius: 20,
          marginHorizontal: 1,
          marginBottom: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        headerShown: false,
      })}
    >
      

 <Tab.Screen
        name="Home"
        component={CHomeScreen}
        options={{
          headerTitle: "Charity HOME",
          headerShown: true,
          headerStyle: {
            paddingTop: 0,
            backgroundColor: '#356F59',
            borderBottomWidth: 0,
            height: 90,

          },
          headerTitleStyle: {
            color: 'white',
            fontWeight: '600',
            fontSize: 25,
            fontFamily: 'System',
            textTransform: 'capitalize',
            letterSpacing: 0.2,
          },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerRightContainerStyle: {
            paddingRight: 1,
          },
          headerTitleContainerStyle: {
            paddingBottom: 8,
          },

        }}
      />


      <Tab.Screen name="Search" component={CSearchScreen} />
      <Tab.Screen name="Notification" component={CNotificationScreen} />
      <Tab.Screen name="Profile" component={CharityDrawerNavigator} />
    </Tab.Navigator>
  );
};

const CharityDrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator drawerContent={(props) => <CDrawerContent {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Profile" component={CProfileScreen} />
    </Drawer.Navigator>
  );
};

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


const RootStack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialScreen, setInitialScreen] = useState("AuthStack");

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();

        const token = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("user");

        if (!token || !user) {
          setInitialScreen("AuthStack");
          return;
        }

        const parsedUser = JSON.parse(user);
        switch (parsedUser.role) {
          case "admin":
            setInitialScreen("AdminStack");
            break;
          case "restaurant":
            setInitialScreen("RestaurantStackNav");
            break;
          case "charity":
            setInitialScreen("CharityStack");
            break;
          default:
            setInitialScreen("AuthStack");
        }
      } catch (e) {
        setInitialScreen("AuthStack");
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SocketProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialScreen}>
            <RootStack.Screen name="AuthStack" component={AuthStack} />
            <RootStack.Screen name="AdminStack" component={AdminStack} />
            <RootStack.Screen name="RestaurantStackNav" component={RestaurantStackNav} />
            <RootStack.Screen name="CharityStack" component={CharityStack} />
            <RootStack.Screen name="UserPending" component={UserPendingScreen} />
            <RootStack.Screen name="Rejected" component={RejectionNoticeScreen} />
          </RootStack.Navigator>
        </NavigationContainer>
      </View>
    </SocketProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
