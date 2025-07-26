import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, getUserStatus } from "../../apis/userAPI";

export default function Login({ navigation }) {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!role || !email || !password) {
      Alert.alert("Missing Info", "All fields are required.");
      return;
    }

    const mappedRole =
      role === "Eatery"
        ? "restaurant"
        : role === "Charity House"
        ? "charity"
        : role;

    setIsLoading(true);

    try {
      const data = await loginUser({ email, password, role: mappedRole });

      if (!data?.token || !data?.user) {
        throw new Error("Invalid response from server");
      }

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("userId", data.user._id);

      const statusRes = await getUserStatus(data.user._id);
      const userStatus = statusRes.status;

      if (userStatus === "pending") {
        navigation.reset({ index: 0, routes: [{ name: "UserPending" }] });
      } else if (userStatus === "rejected") {
        navigation.reset({ index: 0, routes: [{ name: "Rejected" }] });
      } else if (userStatus === "approved") {
        switch (data.user.role) {
          case "admin":
            navigation.reset({ index: 0, routes: [{ name: "AdminStack" }] });
            break;
          case "restaurant":
            navigation.reset({ index: 0, routes: [{ name: "RestaurantStackNav" }] });
            break;
          case "charity":
            navigation.reset({ index: 0, routes: [{ name: "CharityStack" }] });
            break;
          default:
            Alert.alert("Login Error", "Unknown role returned from server.");
        }
      } else {
        Alert.alert("Error", "Unexpected user status");
      }
    } catch (error) {
      Alert.alert("Login Failed", error?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.roleContainer}>
        {["Eatery", "Charity House", "admin"].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleButton, role === r && styles.selectedRole]}
            onPress={() => setRole(r)}
          >
            <Text
              style={[styles.roleText, role === r && styles.selectedRoleText]}
            >
              {r}
            </Text>
          </TouchableOpacity>
        ))}
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#28a745" }]}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.buttonText}>Register New Account</Text>
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
    marginBottom: 24,
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
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "#000099",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  selectedRole: {
    backgroundColor: "#00CCCC",
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
    borderColor: "#00CCCC",
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: "#F9F9F9",
    color: "#000099",
  },
  button: {
    backgroundColor: "#000099",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#00CCCC",
    marginTop: 14,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
