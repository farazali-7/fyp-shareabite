// 3️⃣ OTPVerificationScreen.js — Step 2: Phone OTP
import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { getAuth, signInWithPhoneNumber } from 'firebase/auth';
import firebaseApp from '../../../firebaseConfig';

const auth = getAuth(firebaseApp);

export default function OTPVerificationScreen({ navigation, route }) {
  const recaptchaVerifier = useRef(null);
  const [confirmation, setConfirmation] = useState(null);
  const [code, setCode] = useState('');
  const [formattedNumber, setFormattedNumber] = useState(route.params.contactNumber);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  // Start countdown timer after sending OTP
  const startTimer = () => {
    setResendDisabled(true);
    setTimer(60);
  };

  // Decrease timer every second until it reaches 0
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setResendDisabled(false);
    }
  }, [timer]);

  // Automatically send OTP when screen loads
  useEffect(() => {
    sendOTP();
  }, []);

  // Sends OTP using Firebase Auth
  const sendOTP = async () => {
    try {
      if (!recaptchaVerifier.current) {
        Alert.alert('Recaptcha not ready');
        return;
      }
      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier.current);
      setConfirmation(confirmationResult);
      Alert.alert('OTP sent successfully');
      startTimer();
    } catch (e) {
      console.log(e);
      Alert.alert('Failed to send OTP');
    }
  };

  // Verifies the code entered by user
  const verifyOTP = async () => {
    if (!confirmation) {
      Alert.alert('OTP not sent yet. Please resend.');
      return;
    }
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
      {/* Firebase reCAPTCHA modal must be shown before sending OTP */}
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseApp.options} />

      <TextInput
        placeholder="Enter OTP"
        keyboardType="number-pad"
        style={styles.input}
        value={code}
        onChangeText={setCode}
      />

      <Button title="Verify OTP" onPress={verifyOTP} />

      <View style={styles.resendContainer}>
        <Text style={styles.timerText}>
          {resendDisabled ? `Resend OTP in ${timer}s` : 'Didn’t receive the code?'}
        </Text>
        <Button title="Resend OTP" onPress={sendOTP} disabled={resendDisabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderBottomWidth: 1, marginVertical: 10, padding: 8 },
  resendContainer: { marginTop: 20, alignItems: 'center' },
  timerText: { marginBottom: 8, fontSize: 14, color: '#555' },
});
