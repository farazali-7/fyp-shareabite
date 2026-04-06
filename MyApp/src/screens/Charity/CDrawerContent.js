import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY   = '#356F59';
const TEXT_DARK = '#1C1C1E';
const TEXT_GREY = '#6B6B6B';
const BORDER    = '#EFEFEF';
const BG        = '#FFFFFF';

const MENU = [
  { label: 'Profile',      screen: 'Profile'     },
  { label: 'Edit Profile', screen: 'EditProfile' },
  { label: 'History',      screen: 'History'     },
];

export default function CDrawerContent(props) {
  const navigation = useNavigation();
  const [user, setUser] = useState({ userName: '', email: '' });

  useEffect(() => {
    AsyncStorage.getItem('user').then(raw => {
      if (!raw) return;
      const u = JSON.parse(raw);
      setUser({ userName: u.userName || '', email: u.email || '' });
    });
  }, []);

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user', 'userId']);
          navigation.reset({ index: 0, routes: [{ name: 'AuthStack' }] });
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {user.userName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName} numberOfLines={1}>{user.userName || 'User'}</Text>
          <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
          <Text style={styles.role}>Charity House</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.menu}>
          {MENU.map(item => (
            <TouchableOpacity
              key={item.screen}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.55}
            >
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      <View style={styles.bottom}>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.menuItem} onPress={confirmLogout} activeOpacity={0.55}>
          <Text style={styles.logoutLabel}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: BG },
  scrollContent: { flexGrow: 1 },
  userBlock:     { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: PRIMARY + '18',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarLetter: { fontSize: 18, fontWeight: '600', color: PRIMARY },
  userName:     { fontSize: 16, fontWeight: '600', color: TEXT_DARK, marginBottom: 3 },
  email:        { fontSize: 13, color: TEXT_GREY, marginBottom: 8 },
  role:         { fontSize: 11, color: TEXT_GREY, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6 },
  divider:      { height: 1, backgroundColor: BORDER },
  menu:         { paddingTop: 4 },
  menuItem:     { paddingHorizontal: 20, paddingVertical: 15 },
  menuLabel:    { fontSize: 15, color: TEXT_DARK },
  bottom:       { paddingBottom: 32 },
  logoutLabel:  { fontSize: 15, color: '#D32F2F' },
});
