import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import PhoneInput from "react-native-phone-number-input";
import { checkUserExists } from "../../apis/userAPI";

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [licenseImage, setLicenseImage] = useState(null);
  const [error, setError] = useState("");
  const phoneInput = useRef(null);

  const handleRegister = async () => {
    try {
      if (!userName) {
        Alert.alert("Enter userName", "Please Enter User Name");
        return;
      }
      if (!role) {
        Alert.alert("Select Role", "Please choose a role.");
        return;
      }
      if (!email || !contactNumber) {
        Alert.alert("Missing Credentials", "Please fill in all fields.");
        return;
      }

      const mappedRole = role === "Eatery" ? "restaurant" : "charity";

      const exists = await checkUserExists({ email, contactNumber });
      console.log("🔍 API checkUserExists returned:", exists);

      if (exists === true) {
        Alert.alert(
          "User Exists",
          "User already registered. Redirecting to login..."
        );
        navigation.navigate("Login");
        return;
      }

      // Navigate to OTP screen with proper values
      navigation.navigate("OtpVerification", {
        flow: "register",
        role: mappedRole,
        userName,
        email,
        contactNumber,
        licenseImage,
      });
    } catch (error) {
      console.error(" Registration check failed:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

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
          <Text
            style={[
              styles.roleText,
              role === "Eatery" && styles.selectedRoleText,
            ]}
          >
            Eatery
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "Charity House" && styles.selectedRole,
          ]}
          onPress={() => setRole("Charity House")}
        >
          <Text
            style={[
              styles.roleText,
              role === "Charity House" && styles.selectedRoleText,
            ]}
          >
            Charity House
          </Text>
        </TouchableOpacity>
      </View>

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
        defaultCode="PK"
        layout="first"
        onChangeFormattedText={(text) => {
          setContactNumber(text);
        }}
        withDarkTheme
        autoFocus
      />

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Upload License Image</Text>
      </TouchableOpacity>
      {licenseImage && (
        <Image
          source={{ uri: licenseImage }}
          style={styles.licenseImage}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000099",
  },
  roleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "space-around",
    width: "100%",
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#000099",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  selectedRole: {
    backgroundColor: "#356F59",
  },
  roleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000099",
  },
  selectedRoleText: {
    color: "#FFFFFF",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#356F59",
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#F9F9F9",
    color: "#000099",
  },
  uploadButton: {
    backgroundColor: "#356F59",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  licenseImage: {
    width: 200,
    height: 150,
    marginVertical: 10,
    borderRadius: 10,
    borderColor: "#000099",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#000099",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});