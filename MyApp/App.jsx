import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import Screens
import Login from "./src/screens/Auth/Login";
import RegisterScreen from "./src/screens/Auth/Register";

// Create Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerStyle: { backgroundColor: "#007bff" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      >
        {/* Home Screen with Navigation Buttons */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={Login} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Home Screen with Buttons for Navigation
const HomeScreen = ({ navigation }) => {
  return (
    <View >
      <Text style={styles.title}>Welcome to ShareABite</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.buttonText}>Go to Register</Text>
      </TouchableOpacity>

    
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      </View>
      
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

