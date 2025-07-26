// src/screens/admin/LicenseDetailModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { approveLicense, rejectLicense } from '../../apis/adminAPI';

const LicenseDetailModal = ({ route, navigation }) => {
  const { license, onUpdate, fromTab } = route.params;
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await approveLicense(license._id, comment);
      Alert.alert('Success', 'License approved');
      if (onUpdate) onUpdate();
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectLicense(license._id, comment);
      Alert.alert('Success', 'License rejected');
      if (onUpdate) onUpdate();
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        PROFILE DETAILS: {license.userName?.toUpperCase()} ({license.role})
      </Text>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Icon name="user" size={16} color="#555" />
          <Text style={styles.detailText}>{license.userName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="envelope" size={16} color="#555" />
          <Text style={styles.detailText}>{license.email}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="phone" size={16} color="#555" />
          <Text style={styles.detailText}>{license.contactNumber}</Text>
        </View>

        {fromTab === 'Approved' && (
          <View style={styles.detailRow}>
            <Icon name="calendar-check-o" size={16} color="#555" />
            <Text style={styles.detailText}>
              Approved on: {license.approvedOn || 'N/A'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.imageContainer}>
        {license.licenseImage ? (
          <Image
            source={{ uri: license.licenseImage }}
            style={styles.licenseImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.imageText}>No license image available</Text>
        )}
      </View>

      <TextInput
        style={styles.commentInput}
        placeholder="Add comments..."
        multiline
        value={comment}
        onChangeText={setComment}
      />

      <View style={styles.actionButtons}>
        {fromTab === 'Approved' ? (
          <TouchableOpacity
            style={[styles.rejectButton, styles.fullWidthButton]}
            onPress={handleReject}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'BLOCK AGAIN'}
            </Text>
          </TouchableOpacity>
        ) : fromTab === 'Rejected' ? (
          <TouchableOpacity
            style={[styles.approveButton, styles.fullWidthButton]}
            onPress={handleApprove}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'ACTIVATE AGAIN'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.approveButton, styles.halfWidthButton]}
              onPress={handleApprove}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Approving...' : 'APPROVE'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, styles.halfWidthButton]}
              onPress={handleReject}
              disabled={loading}
            >
              <Text style={styles.buttonText}>REJECT</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  licenseImage: {
    width: 250,
    height: 150,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  rejectButton: {
    backgroundColor: '#f44336',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  fullWidthButton: {
    flex: 1,
  },
  halfWidthButton: {
    width: '48%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
});

export default LicenseDetailModal;
