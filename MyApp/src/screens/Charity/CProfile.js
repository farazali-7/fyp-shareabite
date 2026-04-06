import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserProfile } from '../../apis/userAPI';

const CProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data?.user || null);
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile.');
      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  const handleViewDetails = () => {
    if (profile?._id) navigation.navigate('ViewProfileDetails', { userId: profile._id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="small" color="#356F59" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.emptyText}>No profile data found.</Text>
      </SafeAreaView>
    );
  }

  const initial = profile.userName ? profile.userName.charAt(0).toUpperCase() : '?';

  const SETTINGS = [
    { label: 'View Full Details', onPress: handleViewDetails },
    { label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
    { label: 'Request History', onPress: () => navigation.navigate('History') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#356F59" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{profile.userName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Charity House</Text>
          </View>
          {profile.email ? <Text style={styles.email}>{profile.email}</Text> : null}
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Settings rows */}
        {SETTINGS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.settingsRow, i < SETTINGS.length - 1 && styles.rowBorder]}
            activeOpacity={0.6}
            onPress={item.onPress}
          >
            <Text style={styles.settingsLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CProfileScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F1EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#356F59',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#E8F1EE',
    marginBottom: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#356F59',
  },
  email: {
    fontSize: 13,
    color: '#ABABAB',
    marginTop: 2,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F6F6F6',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
  },
  chevron: {
    fontSize: 20,
    color: '#C7C7CC',
    lineHeight: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#ABABAB',
    fontSize: 14,
    marginTop: 24,
  },
});
