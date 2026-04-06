import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoSplash from 'expo-splash-screen';
import axiosInstance from '../../apis/axiosInstance';

export default function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ExpoSplash.hideAsync().catch(() => {});

    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => checkAuth());
  }, []);

  const checkAuth = async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (!token || !userStr) return navigation.replace('Login');

      const user = JSON.parse(userStr);

      try {
        const timeout = new Promise((_, rej) =>
          setTimeout(() => rej({ isTimeout: true }), 5000)
        );
        await Promise.race([
          axiosInstance.get(`/users/${user._id}/status`),
          timeout,
        ]);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          await AsyncStorage.multiRemove(['token', 'user', 'userId']);
          return navigation.replace('Login');
        }
      }

      let status = 'approved';
      try {
        const res = await axiosInstance.get(`/users/${user._id}/status`);
        status = res.data?.status ?? 'approved';
      } catch (_) {}

      if (status === 'pending')
        return navigation.reset({ index: 0, routes: [{ name: 'UserPending' }] });
      if (status === 'rejected')
        return navigation.reset({ index: 0, routes: [{ name: 'Rejected' }] });

      switch (user.role) {
        case 'admin':
          return navigation.reset({ index: 0, routes: [{ name: 'AdminStack' }] });
        case 'restaurant':
          return navigation.reset({ index: 0, routes: [{ name: 'DonorStack' }] });
        case 'charity':
          return navigation.reset({ index: 0, routes: [{ name: 'CharityStack' }] });
        default:
          return navigation.replace('Login');
      }
    } catch (_) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.center, { opacity }]}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="small"
          color="#ABABAB"
          style={styles.spinner}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  spinner: {
    marginTop: 32,
  },
});
