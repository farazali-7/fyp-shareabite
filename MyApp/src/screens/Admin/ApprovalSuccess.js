import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ApprovalSuccess = ({ route, navigation }) => {
  const { license } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle-outline" size={80} color="#4CAF50" />
      </View>

      <Text style={styles.title}>Approval Successful</Text>

      <Text style={styles.subtitle}>
        <Text style={styles.bold}>{license?.name}</Text> can now log in.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.viewListButton}
          onPress={() => {
            navigation.goBack();
            navigation.navigate('AdminDashboard', { activeTab: 'Approved' });
          }}
        >
          <Ionicons name="list-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>View Approved List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    flexWrap: 'wrap',
  },
  viewListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ApprovalSuccess;
