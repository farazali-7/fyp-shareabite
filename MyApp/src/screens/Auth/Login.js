import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = async () => {
    try {
      if (!role) {
        Alert.alert('Please select a role before logging in.');
        return;
      }
  
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        Alert.alert("Login Failed", data.message);
        return;
      }
  
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
  
      // Navigate based on role
      if (data.user.role === 'admin') {
        navigation.reset({ index: 0, routes: [{ name: 'AdminStack' }] });
      } else if (data.user.role === 'resturant') {
        navigation.reset({ index: 0, routes: [{ name: 'ResturantStackNav' }] });
      } else if (data.user.role === 'charity') {
        navigation.reset({ index: 0, routes: [{ name: 'CharityStack' }] });
      } else {
        Alert.alert('Unknown Role');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    }
  };
  



  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "Redirecting to password reset...");
    navigation.navigate("ForgotPassword");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === "resturant" && styles.selectedRole]}
          onPress={() => setRole("resturant")}
        >
          <Text style={styles.roleText}>Eatery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "charity" && styles.selectedRole]}
          onPress={() => setRole("charity")}
        >
          <Text style={styles.roleText}>Charity House</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "admin" && styles.selectedRole]}
          onPress={() => setRole("admin")}
        >
          <Text style={styles.roleText}>Admin</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "rgba(244, 230, 250, 0.8)" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  roleContainer: { flexDirection: "row", marginBottom: 20 },
  roleButton: { padding: 10, borderWidth: 1, borderColor: "#007bff", borderRadius: 8, marginHorizontal: 5 },
  selectedRole: { backgroundColor: "#007bff" },
  roleText: { fontSize: 16, fontWeight: "bold", color: "black" },
  input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10 },
  forgotPasswordText: { color: "#007bff", marginBottom: 15, textDecorationLine: "underline" },
  button: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" }
});
