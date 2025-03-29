import React, {useRef , useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import PhoneInput from "react-native-phone-number-input";


export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [licenseImage, setLicenseImage] = useState(null);
  const [error, setError] = useState("");
  const phoneInput = useRef(null);


  const handleRegister = () => {
    if (!userName) {
      Alert.alert("Enter userName", "Please Enter User Name");
      return;
    }
    if (!role) {
      Alert.alert("Select Role", "Please choose Eatery or Charity House.");
      return;
    }
    if (!email) {
      Alert.alert("Missing Credentials", "Please fill in all fields.");
      return;
    }
    /* if (!licenseImage) {
       Alert.alert("Upload Required", "Please upload your license image.");
       return;
     }*/

    navigation.navigate("OtpVerification", {
      flow:"register",
      role,
      userName,
      email,
      contactNumber,
      licenseImage,
    });
  };

  // Image Picker for License Upload
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.assets || result.assets.length === 0) return;
    setLicenseImage(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* Role Selection */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === "Eatery" && styles.selectedRole]}
          onPress={() => setRole("Eatery")}
        >
          <Text style={styles.roleText}>Eatery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === "CharityHouse" && styles.selectedRole]}
          onPress={() => setRole("CharityHouse")}
        >
          <Text style={styles.roleText}>Charity House</Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <TextInput
        style={styles.input}
        placeholder="User Name"
        value={userName}
        onChangeText={setUserName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PhoneInput
        ref={phoneInput}
        defaultCode="PK"  // 🇵🇰 Start with Pakistan
        layout="first"
        onChangeFormattedText={(text) => {
          setContactNumber(text);  // Example: +923001234567
        }}
        withDarkTheme
        autoFocus
      />

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      {/* Upload License Image */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Upload License Image</Text>
      </TouchableOpacity>
      {licenseImage && <Image source={{ uri: licenseImage }} style={styles.licenseImage} />}

      {/* Register Button */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(230, 230, 250, 0.8)",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  roleContainer: { flexDirection: "row", marginBottom: 20 },
  roleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    marginHorizontal: 10,
  },
  selectedRole: { backgroundColor: "#007bff" },
  roleText: { fontSize: 16, fontWeight: "bold", color: "black" },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 8, marginBottom: 10 },
  uploadButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  licenseImage: { width: 200, height: 150, marginVertical: 10, borderRadius: 8 },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
