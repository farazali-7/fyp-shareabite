import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function OTPVerificationScreen({ route, navigation }) {
  const { confirmation, phoneNumber } = route.params;
  const [otp, setOtp] = useState("");

  const handleVerifyOTP = async () => {
    try {
      await confirmation.confirm(otp);
      navigation.navigate("ResetPasswordScreen", { phoneNumber });
    } catch (error) {
      Alert.alert("Invalid OTP", "Please enter the correct OTP.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text>OTP sent to {phoneNumber}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: "#28a745", padding: 12, borderRadius: 8, alignItems: "center", width: "100%" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
