import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import auth from "@react-native-firebase/auth";

export default function ForgotPasswordScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSendOTP = async () => {
    if (!phoneNumber.startsWith("+92") || phoneNumber.length < 13) {
      Alert.alert("Invalid Number", "Enter a valid Pakistani phone number (e.g., +923001234567)");
      return;
    }

   
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Phone Number (+92xxxxxxxxxx)"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, alignItems: "center", width: "100%" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
