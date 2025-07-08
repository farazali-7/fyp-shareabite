import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
} from 'react-native';
import { registerUser } from '../../apis/userAPI';

export default function SetPasswordScreen({ route, navigation }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleFinish = async () => {
    if (!password || !confirmPassword) {
      return Alert.alert('Missing Fields', 'Please fill both password fields');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Mismatch', 'Passwords do not match');
    }
    if (password.length < 6) {
      return Alert.alert('Too Short', 'Password must be at least 6 characters');
    }

    const { role, userName, email, contactNumber, licenseImage } = route.params;

    const mappedRole =
      role === 'Eatery'
        ? 'restaurant'
        : role === 'Charity House'
        ? 'charity'
        : role;

    const formData = new FormData();
    formData.append('role', mappedRole);
    formData.append('userName', userName);
    formData.append('email', email);
    formData.append('contactNumber', contactNumber);
    formData.append('password', password);

    formData.append('licenseImage', {
      uri: licenseImage,
      type: 'image/jpeg',
      name: 'license.jpg',
    });

    // ✅ Debugging: Log formData
    console.log('Form Data Preview:');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      const res = await registerUser(formData);

      Alert.alert('Success', res.message || 'Registration successful', [
        { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      console.error('Registration Error:', err); // ✅ Will now log full Error
      Alert.alert('Registration Failed', err.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter New Password</Text>
      <TextInput
        secureTextEntry
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        secureTextEntry
        placeholder="Confirm Password"
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button title="Finish Registration" onPress={handleFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
});
