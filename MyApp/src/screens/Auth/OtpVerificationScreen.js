// 3️⃣ OTPVerificationScreen.js – Step 2: Phone OTP
import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { getAuth, signInWithPhoneNumber } from 'firebase/auth';
import firebaseApp from '../../../firebaseConfig';

const auth = getAuth(firebaseApp);

export default function OTPVerificationScreen({ navigation, route }) {
  const recaptchaRef = useRef(null);
  const [confirmation, setConfirmation] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  const { contactNumber, flow, ...restParams } = route.params;

  // Countdown timer logic
  const startTimer = () => {
    setResendDisabled(true);
    setTimer(60);
  };

  useEffect(() => {
    if (timer <= 0) {
      setResendDisabled(false);
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-send OTP after short delay to ensure reCAPTCHA is mounted
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!confirmation && recaptchaRef.current) sendOTP();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  const sendOTP = async () => {
    try {
      if (!contactNumber.startsWith('+')) {
        Alert.alert('Phone number must include country code (e.g. +92...)');
        return;
      }

      if (!recaptchaRef.current) {
        Alert.alert('reCAPTCHA not ready yet. Try again in a second.');
        return;
      }

      console.log('Sending OTP to:', contactNumber);
      const result = await signInWithPhoneNumber(auth, contactNumber, recaptchaRef.current);
      setConfirmation(result);
      Alert.alert('OTP sent successfully ✓');
      startTimer();
    } catch (e) {
      console.error('OTP send error:', e);
      Alert.alert('Failed to send OTP', e.message);
    }
  };

  const verifyOTP = async () => {
    if (!confirmation) {
      Alert.alert('OTP not sent yet. Please resend.');
      return;
    }

    if (code.trim().length === 0) {
      Alert.alert('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmation.confirm(code);
      const verifiedPhone = result.user.phoneNumber;
      console.log(' Phone verified:', verifiedPhone);

      if (flow === 'register') {
        navigation.navigate('SetPassword', {
          contactNumber: verifiedPhone,
          ...restParams,
        });
      } else if (flow === 'forgot') {
        navigation.navigate('ResetPassword', {
          contactNumber: verifiedPhone,
        });
      }
    } catch (e) {
      console.error('OTP verification failed:', e);
      Alert.alert('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseApp.options}
      />

      <TextInput
        placeholder="Enter OTP"
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
        value={code}
        onChangeText={setCode}
      />

      <Button
        title={loading ? 'Verifying...' : 'Verify OTP'}
        onPress={verifyOTP}
        disabled={loading}
      />

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
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderBottomWidth: 1, marginVertical: 10, padding: 8 },
  resendContainer: { marginTop: 20, alignItems: 'center' },
  timerText: { marginBottom: 8, fontSize: 14, color: '#555' },
});
