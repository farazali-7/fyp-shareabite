import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';

export default function SetPasswordScreen({ route , navigation}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleFinish = () => {
    if (!password || !confirmPassword) {
      return Alert.alert('Please fill both password fields');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Passwords do not match');
    }
    if (password.length < 6) {
      return Alert.alert('Password must be at least 6 characters');
    }

    navigation.navigate("Login")
    console.log('User info:', route.params ,password);
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
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
});
