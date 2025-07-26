import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { rejectLicense } from '../../apis/adminAPI';

const rejectionReasons = [
  { id: 1, label: 'Image Unclear' },
  { id: 2, label: 'Expired' },
  { id: 3, label: 'Invalid Info' },
];

const RejectionFlow = ({ route, navigation }) => {
  const { license } = route.params;
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState('');

  const toggleReason = (reasonId) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId) ? prev.filter((id) => id !== reasonId) : [...prev, reasonId]
    );
  };

  const handleReject = async () => {
    const selectedLabels = rejectionReasons
      .filter((r) => selectedReasons.includes(r.id))
      .map((r) => r.label);

    const combinedReason = [...selectedLabels, otherReason].filter(Boolean).join(', ');

    if (!combinedReason) {
      Alert.alert('Please provide a rejection reason.');
      return;
    }

    try {
      await rejectLicense(license._id, combinedReason);
      Alert.alert('Registration Rejected');
      navigation.navigate('AdminDashboard');
    } catch (err) {
      console.error('❌ Rejection Error:', err);
      Alert.alert('Error rejecting license');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>REJECT REGISTRATION</Text>
      <Text style={styles.subtitle}>Reason:</Text>

      <ScrollView style={styles.reasonsContainer}>
        {rejectionReasons.map((reason) => (
          <TouchableOpacity
            key={reason.id}
            style={styles.reasonItem}
            onPress={() => toggleReason(reason.id)}
          >
            <Text style={styles.reasonText}>
              {selectedReasons.includes(reason.id) ? '✔ ' : '○ '}
              {reason.label}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.otherLabel}>Other:</Text>
        <View style={styles.otherInputContainer}>
          <TextInput
            style={styles.otherInput}
            value={otherReason}
            onChangeText={setOtherReason}
            placeholder="Specify other reason..."
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleReject}>
          <Text style={styles.buttonText}>CONFIRM REJECTION</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  reasonsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  reasonItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reasonText: {
    fontSize: 16,
  },
  otherLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  otherInputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
  },
  otherInput: {
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f44336',
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#999',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RejectionFlow;

