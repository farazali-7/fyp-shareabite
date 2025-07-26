import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const RejectionNoticeScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userName = "User", message = "Your application was not approved" } = route.params || {};

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@yourapp.com?subject=Account Rejection Appeal');
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'AuthStack' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="close-circle" size={60} color="#e74c3c" style={styles.icon} />

        <Text style={styles.title}>Account Not Approved</Text>
        <Text style={styles.greeting}>Hello, {userName}</Text>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>Reason:</Text>
          <Text style={styles.reasonText}>{message}</Text>
        </View>

        <Text style={styles.instructions}>
          If you believe this was a mistake or would like to appeal, please contact our support team.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.appealButton]}
          onPress={handleContactSupport}
        >
          <Ionicons name="mail" size={20} color="white" />
          <Text style={styles.buttonText}>Appeal Decision</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="white" />
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 25,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 20,
  },
  reasonBox: {
    backgroundColor: '#fdedec',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  reasonTitle: {
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  reasonText: {
    color: '#7f8c8d',
    lineHeight: 20,
  },
  instructions: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  appealButton: {
    backgroundColor: '#3498db',
  },
  logoutButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default RejectionNoticeScreen;
