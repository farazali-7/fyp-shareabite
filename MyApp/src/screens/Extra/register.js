import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [role, setRole] = useState(null);
  const [userName, setuserName] = useState(null);
  const [email, setEmail] = useState("");
  const [contactNumber, setcontactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [licenseImage, setLicenseImage] = useState(null);

  const handleRegister = () => {
    if (!role) {
      Alert.alert("Select Role", "Please choose Eatery or Charity House.");
      return;
    }
    if (!email || !password) {
      Alert.alert("Missing Credentials", "Please enter email and password.");
      return;
    }
    if (!licenseImage) {
      Alert.alert("Upload Required", "Please upload your license image.");
      return;
    }
    Alert.alert("Registration Successful", `Registered as ${role}`);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setLicenseImage(result.uri);
    }
  };

  return (
    <ImageBackground source={require("./assets/food-pattern.png")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        
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
        </View>

        <TextInput
          style={styles.input}
          placeholder="userName"
          value={userName}
          onChangeText={setuserName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
          <TextInput
          style={styles.input}
          placeholder="Contact Number"
          value={contactNumber}
          onChangeText={setcontactNumber}
          keyboardType="number"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadButtonText}>Upload License Image</Text>
        </TouchableOpacity>
        {licenseImage && <Image source={{ uri: licenseImage }} style={styles.licenseImage} />}
        
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover", justifyContent: "center" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "rgba(230, 230, 250, 0.8)" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  roleContainer: { flexDirection: "row", marginBottom: 20 },
  roleButton: { padding: 10, borderWidth: 1, borderColor: "#007bff", borderRadius: 8, marginHorizontal: 10 },
  selectedRole: { backgroundColor: "#007bff" },
  roleText: { fontSize: 16, fontWeight: "bold", color: "black" },
  input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10 },
  uploadButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 8, marginBottom: 10 },
  uploadButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  licenseImage: { width: 200, height: 150, marginVertical: 10, borderRadius: 8 },
  button: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" }
});
