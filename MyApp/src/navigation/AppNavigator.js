import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        setUserRole(role);
      } catch (error) {
        console.log("Error fetching role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userRole && <Stack.Screen name="Auth" component={AuthNavigator} />}
      {userRole === "admin" && <Stack.Screen name="Admin" component={AdminNavigator} />}
      {userRole === "restaurant" && <Stack.Screen name="Restaurant" component={RestaurantNavigator} />}
      {userRole === "charity" && <Stack.Screen name="Charity" component={CharityNavigator} />}
    </Stack.Navigator>
  );
};

export default AppNavigator;
