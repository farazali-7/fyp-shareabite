// 1️⃣ App.js — Setup Navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './screens/RegisterScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import SetPasswordScreen from './screens/SetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register">
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


// 2️⃣ RegisterScreen.js — Step 1: User Info + Image
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', contactNumber: '', role: 'eatery' });
  const [licenseImage, setLicenseImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      setLicenseImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!form.name || !form.email || !form.contactNumber || !licenseImage) {
      return Alert.alert('Please fill all fields and upload license image');
    }
    navigation.navigate('OTPVerification', { ...form, licenseImage });
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" style={styles.input} onChangeText={(v) => setForm({ ...form, name: v })} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={(v) => setForm({ ...form, email: v })} />
      <TextInput placeholder="Contact Number" style={styles.input} keyboardType="phone-pad" onChangeText={(v) => setForm({ ...form, contactNumber: v })} />
      <Button title="Upload License Image" onPress={pickImage} />
      {licenseImage && <Image source={{ uri: licenseImage }} style={{ width: 100, height: 100, marginTop: 10 }} />}
      <Button title="Next" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
});


// 3️⃣ OTPVerificationScreen.js — Step 2: Phone OTP
import React, { useRef, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { getAuth, signInWithPhoneNumber } from 'firebase/auth';
import PhoneInput from 'react-native-phone-number-input';
import firebaseApp from '../firebaseConfig';

const auth = getAuth(firebaseApp);

export default function OTPVerificationScreen({ navigation, route }) {
  const recaptchaVerifier = useRef(null);
  const [confirmation, setConfirmation] = useState(null);
  const [code, setCode] = useState('');
  const [formattedNumber, setFormattedNumber] = useState(route.params.contactNumber);

  const sendOTP = async () => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier.current);
      setConfirmation(confirmationResult);
      Alert.alert('OTP sent');
    } catch (e) {
      console.log(e);
      Alert.alert('Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    try {
      const result = await confirmation.confirm(code);
      const verifiedPhone = result.user.phoneNumber;
      navigation.navigate('SetPassword', { ...route.params, contactNumber: verifiedPhone });
    } catch (e) {
      console.log(e);
      Alert.alert('Invalid OTP');
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseApp.options} />
      <Button title="Send OTP" onPress={sendOTP} />
      <TextInput placeholder="Enter OTP" keyboardType="number-pad" style={styles.input} value={code} onChangeText={setCode} />
      <Button title="Verify" onPress={verifyOTP} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderBottomWidth: 1, marginVertical: 10, padding: 8 },
});


// 4️⃣ SetPasswordScreen.js — Step 3: Password
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function SetPasswordScreen({ route, navigation }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) return Alert.alert("Passwords don't match");

    const formData = new FormData();
    formData.append('name', route.params.name);
    formData.append('email', route.params.email);
    formData.append('contactNumber', route.params.contactNumber);
    formData.append('role', route.params.role);
    formData.append('password', password);
    formData.append('licenseImage', {
      uri: route.params.licenseImage,
      type: 'image/jpeg',
      name: 'license.jpg',
    });

    try {
      await axios.post('https://your-backend-url.com/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Alert.alert('Registered Successfully');
    } catch (error) {
      console.log(error);
      Alert.alert('Registration Failed');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} />
      <Button title="Submit Registration" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
});
