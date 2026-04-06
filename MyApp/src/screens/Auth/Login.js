import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, getUserStatus } from '../../apis/userAPI';

const PRIMARY   = '#356F59';
const TEXT_DARK = '#1C1C1E';
const TEXT_GREY = '#6B6B6B';
const TEXT_LIGHT = '#ABABAB';
const BORDER    = '#E2E2E2';
const ERROR     = '#D32F2F';
const BG        = '#FFFFFF';

const ROLES = [
  { label: 'Eatery',        value: 'Eatery'       },
  { label: 'Charity House', value: 'Charity House' },
  { label: 'Admin',         value: 'admin'         },
];

function Field({ label, error, children }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
      {!!error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap:  { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: TEXT_GREY, marginBottom: 6 },
  error: { fontSize: 12, color: ERROR, marginTop: 4 },
});

export default function Login({ navigation }) {
  const [role,      setRole]      = useState(null);
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const shakeX    = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef(null);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 4,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0,  duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setError('');
    if (!role)           return (setError('Select your account type.'),    shake());
    if (!email.trim())   return (setError('Enter your email address.'),    shake());
    if (!password)       return (setError('Enter your password.'),         shake());

    const mappedRole =
      role === 'Eatery'        ? 'restaurant' :
      role === 'Charity House' ? 'charity'    : 'admin';

    setLoading(true);
    try {
      const data = await loginUser({ email: email.trim(), password, role: mappedRole });
      if (!data?.token || !data?.user) throw new Error('Unexpected response from server.');

      await AsyncStorage.multiSet([
        ['token',  data.token],
        ['user',   JSON.stringify(data.user)],
        ['userId', data.user._id],
      ]);

      const { status } = await getUserStatus(data.user._id);

      if (status === 'pending')
        return navigation.reset({ index: 0, routes: [{ name: 'UserPending' }] });
      if (status === 'rejected')
        return navigation.reset({ index: 0, routes: [{ name: 'Rejected' }] });

      switch (data.user.role) {
        case 'admin':
          return navigation.reset({ index: 0, routes: [{ name: 'AdminStack' }] });
        case 'restaurant':
          return navigation.reset({ index: 0, routes: [{ name: 'DonorStack' }] });
        case 'charity':
          return navigation.reset({ index: 0, routes: [{ name: 'CharityStack' }] });
        default:
          setError('Unknown account type. Please contact support.');
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message ?? 'Login failed. Try again.';
      setError(msg);
      shake();
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!role && email.trim().length > 0 && password.length > 0 && !loading;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 16}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subHeading}>Sign in to your account</Text>
          </View>

          {/* Role selector */}
          <View style={styles.roleRow}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleTab, role === r.value && styles.roleTabActive]}
                onPress={() => { setRole(r.value); setError(''); }}
                activeOpacity={0.65}
              >
                <Text style={[styles.roleTabText, role === r.value && styles.roleTabTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fields */}
          <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
            <Field label="Email">
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={TEXT_LIGHT}
                value={email}
                onChangeText={t => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </Field>

            <Field label="Password">
              <View style={styles.passwordRow}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={TEXT_LIGHT}
                  value={password}
                  onChangeText={t => { setPassword(t); setError(''); }}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={canSubmit ? handleLogin : undefined}
                />
                <TouchableOpacity
                  style={styles.showPassBtn}
                  onPress={() => setShowPass(s => !s)}
                >
                  <Text style={styles.showPassText}>{showPass ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </Field>
          </Animated.View>

          {/* Error */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Forgot password */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotRow}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.btn, !canSubmit && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text style={styles.btnText}>Sign in</Text>
            }
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 15,
    color: TEXT_GREY,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  roleTab: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG,
  },
  roleTabActive: {
    borderColor: PRIMARY,
    backgroundColor: '#EFF6F3',
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_GREY,
  },
  roleTabTextActive: {
    color: PRIMARY,
    fontWeight: '600',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: TEXT_DARK,
    backgroundColor: BG,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showPassBtn: {
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: BORDER,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showPassText: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    color: ERROR,
    marginBottom: 12,
    marginTop: -4,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
  },
  btn: {
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  btnDisabled: {
    backgroundColor: '#A8C4BB',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: TEXT_GREY,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
});
