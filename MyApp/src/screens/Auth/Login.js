import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function Login({ navigation }) {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!role) {
      Alert.alert("Select Role", "Please choose Eatery, Charity House, or Admin.");
      return;
    }
    if (!username || !password) {
      Alert.alert("Missing Credentials", "Please enter username and password.");
      return;
    }
    Alert.alert("Login Successful", `Logged in as ${role}`);
  };

  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "Redirecting to password reset...");
    navigation.navigate("ForgotPassword")
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={[styles.roleButton, role === "Eatery" && styles.selectedRole]} 
          onPress={() => setRole("Eatery")}
        >
          <Text style={styles.roleText}>Eatery</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.roleButton, role === "Charity House" && styles.selectedRole]} 
          onPress={() => setRole("Charity House")}
        >
          <Text style={styles.roleText}>Charity House</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.roleButton, role === "Admin" && styles.selectedRole]} 
          onPress={() => setRole("Admin")}
        >
          <Text style={styles.roleText}>Admin</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
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
