import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { resetUserPassword } from '../../apis/userAPI';

const PRIMARY    = '#356F59';
const TEXT_DARK  = '#1C1C1E';
const TEXT_GREY  = '#6B6B6B';
const TEXT_LIGHT = '#ABABAB';
const BORDER     = '#E2E2E2';
const ERROR      = '#D32F2F';
const BG         = '#FFFFFF';

export default function ResetPasswordScreen({ route, navigation }) {
  const { resetToken } = route.params;

  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);

  const confirmRef = useRef(null);

  const validate = () => {
    if (!password)                       return 'Enter your new password.';
    if (password.length < 8)             return 'Password must be at least 8 characters.';
    if (!confirmPassword)                return 'Please confirm your password.';
    if (password !== confirmPassword)    return 'Passwords do not match.';
    return null;
  };

  const handleReset = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await resetUserPassword({ resetToken, newPassword: password });
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Failed to reset password. The link may have expired — please start over.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        <View style={styles.successWrap}>
          <Text style={styles.successTitle}>Password updated</Text>
          <Text style={styles.successSub}>You can now sign in with your new password.</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          >
            <Text style={styles.btnText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const canSubmit = password.length > 0 && confirmPassword.length > 0 && !loading;

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.heading}>Set new password</Text>
            <Text style={styles.subHeading}>Your new password must be at least 8 characters.</Text>
          </View>

          {/* New password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>New password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                placeholder="Min. 8 characters"
                placeholderTextColor={TEXT_LIGHT}
                value={password}
                onChangeText={t => { setPassword(t); setError(''); }}
                secureTextEntry={!showPass}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              <TouchableOpacity style={styles.showBtn} onPress={() => setShowPass(s => !s)}>
                <Text style={styles.showBtnText}>{showPass ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Confirm password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                ref={confirmRef}
                style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                placeholder="Re-enter password"
                placeholderTextColor={TEXT_LIGHT}
                value={confirmPassword}
                onChangeText={t => { setConfirmPassword(t); setError(''); }}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={canSubmit ? handleReset : undefined}
              />
              <TouchableOpacity style={styles.showBtn} onPress={() => setShowConfirm(s => !s)}>
                <Text style={styles.showBtnText}>{showConfirm ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, !canSubmit && styles.btnDisabled]}
            onPress={handleReset}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text style={styles.btnText}>Reset password</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 4, marginBottom: 24 },
  backText: { fontSize: 15, fontWeight: '500', color: TEXT_DARK },
  header: { marginBottom: 32 },
  heading: { fontSize: 26, fontWeight: '700', color: TEXT_DARK, marginBottom: 6 },
  subHeading: { fontSize: 15, color: TEXT_GREY, lineHeight: 22 },
  fieldWrap: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '500', color: TEXT_GREY, marginBottom: 8 },
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
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  showBtn: {
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
  showBtnText: { fontSize: 13, color: PRIMARY, fontWeight: '500' },
  errorText: { fontSize: 13, color: ERROR, marginBottom: 16 },
  btn: {
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#A8C4BB' },
  btnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  successWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    alignItems: 'center',
  },
  successTitle: { fontSize: 26, fontWeight: '700', color: TEXT_DARK, marginBottom: 12, textAlign: 'center' },
  successSub: { fontSize: 15, color: TEXT_GREY, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
});
