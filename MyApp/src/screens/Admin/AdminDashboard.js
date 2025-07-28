// src/screens/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  getPendingLicenses,
  getApprovedLicenses,
  getRejectedLicenses,
  approveLicense,
  rejectLicense
} from '../../apis/adminAPI';

const AdminDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingLicenses, setPendingLicenses] = useState([]);
  const [approvedLicenses, setApprovedLicenses] = useState([]);
  const [rejectedLicenses, setRejectedLicenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const [pending, approved, rejected] = await Promise.all([
        getPendingLicenses(),
        getApprovedLicenses(),
        getRejectedLicenses(),
      ]);
      setPendingLicenses(pending || []);
      setApprovedLicenses(approved || []);
      setRejectedLicenses(rejected || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (license) => {
    try {
      setLoading(true);
      await approveLicense(license._id);
      navigation.navigate('ApprovalSuccess', { license });
      fetchLicenses();
    } catch (err) {
      Alert.alert('Error', 'Failed to approve license');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (license) => {
    navigation.navigate('RejectionFlow', { license, onReject: fetchLicenses });
  };

  const renderLicenseRow = (license, tab) => (
    <TouchableOpacity
      key={license._id}
      style={styles.licenseRow}
      onPress={() =>
        navigation.navigate('LicenseDetailModal', {
          license,
          onUpdate: fetchLicenses,
          fromTab: tab,
        })
      }
    >
      <Text style={styles.licenseId}>{license._id?.slice(-4) || '----'}</Text>
      <View style={styles.licenseInfo}>
        <Text style={styles.licenseName}>{license.userName || 'Unnamed'}</Text>
        <Text style={styles.licenseRole}>{license.role || 'Unknown Role'}</Text>
        {tab === 'Rejected' && (
          <Text style={styles.rejectReason}>
            Reason: {license.rejectionReason || 'N/A'}
          </Text>
        )}
      </View>
      {tab === 'Pending' ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(license)}
          >
            <Icon name="check" size={20} color="green" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(license)}
          >
            <Icon name="times" size={20} color="red" />
          </TouchableOpacity>
        </View>
      ) : (
        <Text
          style={
            tab === 'Approved' ? styles.approvedDate : styles.rejectedDate
          }
        >
          {tab === 'Approved'
            ? license.approvedOn || 'Approved'
            : license.rejectedOn || 'Rejected'}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    const data =
      activeTab === 'Pending'
        ? pendingLicenses
        : activeTab === 'Approved'
        ? approvedLicenses
        : rejectedLicenses;

    const filtered = data.filter((l) =>
      (l.userName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <ActivityIndicator size="large" color="#000" />;

    return (
      <ScrollView style={styles.tabContent}>
        {filtered.length > 0 ? (
          filtered.map((l) => renderLicenseRow(l, activeTab))
        ) : (
          <Text style={styles.noResults}>
            No {activeTab.toLowerCase()} licenses found.
          </Text>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <Text style={styles.headerTitle}>License Approval System</Text>
       <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="ellipsis-v" size={33} color="#356F59" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {['Pending', 'Approved', 'Rejected'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabText}>
              {tab} (
              {tab === 'Pending'
                ? pendingLicenses.length
                : tab === 'Approved'
                ? approvedLicenses.length
                : rejectedLicenses.length}
              )
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
  },

  customHeader: {
    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 14,
    marginBottom: 10,
  },

  headerTitle: {
    paddingTop:8,
    backgroundColor:'#356F59',
textAlign: 'center',
    fontSize: 22,
    width:280,
    height:50,
    fontWeight: 'bold',
    color: 'white',
  },

  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  tab: {
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'white',
  },

  activeTab: {
    borderBottomColor: '#00cc00',

  },

  tabText: {
    fontWeight: '600',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    height: 40,
  },

  tabContent: {
    flex: 1,
  },

  licenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  licenseId: {
    width: 40,
    fontWeight: 'bold',
  },

  licenseInfo: {
    flex: 1,
    marginLeft: 10,
  },

  licenseName: {
    fontWeight: '600',
  },

  licenseRole: {
    color: '#555',
    fontSize: 12,
  },

  rejectReason: {
    color: '#b22222',
    fontSize: 12,
  },

  actions: {
    flexDirection: 'row',
  },

  approveButton: {
    padding: 8,
    marginRight: 5,
  },

  rejectButton: {
    padding: 8,
  },

  approvedDate: {
    paddingTop:3,
paddingLeft:9,
    color: 'white',
    fontSize: 12,
    backgroundColor:'green',
    width:70,
    height:30
  },

  rejectedDate: {
     paddingTop:3,
paddingLeft:9,
    color: 'white',
    fontSize: 12,
    backgroundColor:'red',
    width:70,
    height:30
  },

  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    color: '#333',
  },
});

export default AdminDashboard;
