import React, { useEffect } from "react";
import { View } from "react-native";
import * as ExpoSplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SocketProvider } from "./src/context/SocketContext";

// Auth
import SplashScreen from "./src/screens/Auth/SplashScreen";
import Login from "./src/screens/Auth/Login";
import RegisterScreen from "./src/screens/Auth/Register";
import OTPVerificationScreen from "./src/screens/Auth/OtpVerificationScreen";
import SetPasswordScreen from "./src/screens/Auth/SetPassword";
import ForgotPasswordScreen from "./src/screens/Auth/ForgotPassword";
import ResetPasswordScreen from "./src/screens/Auth/ResetPassword";

// Admin
import AdminDashboard from "./src/screens/Admin/AdminDashboard";
import ApprovalSuccess from "./src/screens/Admin/ApprovalSuccess";
import LicenseDetailModal from "./src/screens/Admin/LicenseDetailModal";
import RejectionFlow from "./src/screens/Admin/RejectionFlow";
import AdminDrawerContent from "./src/screens/Admin/AdminDrawerContent";

// Donor screens
import DonorMyFoodScreen from "./src/screens/Resturant/DonorMyFoodScreen";
import DonorRequestsScreen from "./src/screens/Resturant/DonorRequestsScreen";
import PostFormScreen from "./src/screens/Resturant/PostFormScreen";
import RProfileScreen from "./src/screens/Resturant/RProfile";
import REditProfileScreen from "./src/screens/Resturant/REditProfile";
import RHistoryScreen from "./src/screens/Resturant/RHistory";
import EditPostScreen from "./src/screens/Resturant/REditPostScreen";
import RViewProfileDetails from "./src/screens/Resturant/RViewProfileDetails";
import RSearchViewProfileScreen from "./src/screens/Resturant/RSearchViewProfile";
import RSearchScreen from "./src/screens/Resturant/RSearch";
import RChatListScreen from "./src/screens/Resturant/RChatScreens/RChatListScreen";
import RChatScreen from "./src/screens/Resturant/RChatScreens/RChatScreen";
import RSearchUsersScreen from "./src/screens/Resturant/RChatScreens/RSearchUsersScreen";
import RContactUsScreen from "./src/screens/Resturant/RContactFile";

// Charity screens
import CharityFoodScreen from "./src/screens/Charity/CharityFoodScreen";
import PostDetailScreen from "./src/screens/Charity/PostDetailScreen";
import CharityMyRequestsScreen from "./src/screens/Charity/CharityMyRequestsScreen";
import CProfileScreen from "./src/screens/Charity/CProfile";
import CEditProfileScreen from "./src/screens/Charity/CEditProfile";
import CHistoryScreen from "./src/screens/Charity/CHistory";
import CSearchScreen from "./src/screens/Charity/CSearch";
import CSearchViewProfileScreen from "./src/screens/Charity/CSearchViewProfile";
import CChatListScreen from "./src/screens/Charity/CChatScreens/CChatListScreen";
import CChatScreen from "./src/screens/Charity/CChatScreens/CChatScreen";
import CSearchUsersScreen from "./src/screens/Charity/CChatScreens/CSearchUsersScreen";

// Status screens
import UserPendingScreen from "./src/screens/valid/UserPendingScreen";
import RejectionNoticeScreen from "./src/screens/valid/RejectionNoticeScreen";

// ─── Admin ────────────────────────────────────────────────────────────────────

const AdminDrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AdminDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="AdminDashboard" component={AdminDashboard} />
    </Drawer.Navigator>
  );
};

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

// ─── Donor ────────────────────────────────────────────────────────────────────

const TAB_BAR_STYLE = {
  backgroundColor: '#FFFFFF',
  height: 58,
  borderTopWidth: 1,
  borderTopColor: '#EFEFEF',
  paddingBottom: 6,
  paddingTop: 6,
  elevation: 0,
  shadowOpacity: 0,
};

const TAB_ICON_MAP = {
  MyFood:    { active: 'grid',         inactive: 'grid-outline' },
  Requests:  { active: 'albums',       inactive: 'albums-outline' },
  Messages:  { active: 'chatbubbles',  inactive: 'chatbubbles-outline' },
  Account:   { active: 'person',       inactive: 'person-outline' },
  Food:      { active: 'leaf',         inactive: 'leaf-outline' },
  MyRequests:{ active: 'time',         inactive: 'time-outline' },
};

const DonorTabs = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarActiveTintColor: '#356F59',
        tabBarInactiveTintColor: '#ABABAB',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICON_MAP[route.name];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="MyFood"    component={DonorMyFoodScreen}    options={{ tabBarLabel: 'My Food' }} />
      <Tab.Screen name="Requests"  component={DonorRequestsScreen}  options={{ tabBarLabel: 'Requests' }} />
      <Tab.Screen name="Messages"  component={RChatListScreen}       options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="Account"   component={RProfileScreen}        options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
};

const DonorStack = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DonorTabs"             component={DonorTabs} />
      <Stack.Screen name="PostForm"              component={PostFormScreen} />
      <Stack.Screen name="EditPostScreen"        component={EditPostScreen} />
      <Stack.Screen name="EditProfile"           component={REditProfileScreen} />
      <Stack.Screen name="History"               component={RHistoryScreen} />
      <Stack.Screen name="ViewProfileDetails"    component={RViewProfileDetails} />
      <Stack.Screen name="SearchViewProfileScreen" component={RSearchViewProfileScreen} />
      <Stack.Screen name="Search"                component={RSearchScreen} />
      <Stack.Screen name="ContactUs"             component={RContactUsScreen} />
      <Stack.Screen name="DonorChat"             component={RChatScreen} />
      <Stack.Screen name="DonorChatSearch"       component={RSearchUsersScreen} />
    </Stack.Navigator>
  );
};

// ─── Charity ──────────────────────────────────────────────────────────────────

const CharityTabs = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarActiveTintColor: '#356F59',
        tabBarInactiveTintColor: '#ABABAB',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICON_MAP[route.name];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Food"        component={CharityFoodScreen}        options={{ tabBarLabel: 'Food' }} />
      <Tab.Screen name="MyRequests"  component={CharityMyRequestsScreen}  options={{ tabBarLabel: 'My Requests' }} />
      <Tab.Screen name="Messages"    component={CChatListScreen}           options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="Account"     component={CProfileScreen}            options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
};

const CharityStack = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CharityTabs"           component={CharityTabs} />
      <Stack.Screen name="PostDetail"            component={PostDetailScreen} />
      <Stack.Screen name="EditProfile"           component={CEditProfileScreen} />
      <Stack.Screen name="History"               component={CHistoryScreen} />
      <Stack.Screen name="SearchViewProfileScreen" component={CSearchViewProfileScreen} />
      <Stack.Screen name="Search"                component={CSearchScreen} />
      <Stack.Screen name="CharityChat"           component={CChatScreen} />
      <Stack.Screen name="CharityChatSearch"     component={CSearchUsersScreen} />
    </Stack.Navigator>
  );
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

const AuthStack = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"         component={SplashScreen} />
      <Stack.Screen name="Login"          component={Login} />
      <Stack.Screen name="Register"       component={RegisterScreen} />
      <Stack.Screen name="OtpVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="SetPassword"    component={SetPasswordScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword"  component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────

const RootStack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    ExpoSplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  return (
    <SocketProvider>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AuthStack">
            <RootStack.Screen name="AuthStack"    component={AuthStack} />
            <RootStack.Screen name="AdminStack"   component={AdminStack} />
            <RootStack.Screen name="DonorStack"   component={DonorStack} />
            <RootStack.Screen name="CharityStack" component={CharityStack} />
            <RootStack.Screen name="UserPending"  component={UserPendingScreen} />
            <RootStack.Screen name="Rejected"     component={RejectionNoticeScreen} />
          </RootStack.Navigator>
        </NavigationContainer>
      </View>
    </SocketProvider>
  );
}
