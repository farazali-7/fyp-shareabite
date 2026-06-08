import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';

const PRIMARY    = '#356F59';
const TEXT_DARK  = '#1C1C1E';
const TEXT_GREY  = '#6B6B6B';
const TEXT_LIGHT = '#ABABAB';
const BORDER     = '#E2E2E2';
const ERROR      = '#D32F2F';
const BG         = '#FFFFFF';

export default function ForgotPasswordScreen({ navigation }) {
  const [contactNumber, setContactNumber] = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  const phoneRef = useRef(null);

  const handleSubmit = () => {
    setError('');
    if (!contactNumber) {
      setError('Enter your registered phone number.');
      return;
    }
    const isValid = phoneRef.current?.isValidNumber(contactNumber);
    if (!isValid) {
      setError('Enter a valid phone number including country code.');
      return;
    }
    setLoading(true);
    // Navigate to OTP screen — OTP is sent there, not here
    navigation.navigate('OtpVerification', { flow: 'forgot', contactNumber });
    setLoading(false);
  };

  const canSubmit = contactNumber.length > 4 && !loading;

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
            <Text style={styles.heading}>Reset password</Text>
            <Text style={styles.subHeading}>
              Enter your registered phone number. We'll send a verification code to confirm it's you.
            </Text>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Phone number</Text>
            <View style={[styles.phoneWrap, !!error && styles.phoneWrapError]}>
              <PhoneInput
                ref={phoneRef}
                defaultCode="PK"
                layout="first"
                onChangeFormattedText={t => { setContactNumber(t); setError(''); }}
                containerStyle={styles.phoneContainer}
                textContainerStyle={styles.phoneTextContainer}
                textInputStyle={styles.phoneTextInput}
                codeTextStyle={styles.phoneCodeText}
                flagButtonStyle={styles.phoneFlagBtn}
                withDarkTheme={false}
                withShadow={false}
              />
            </View>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.btn, !canSubmit && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text style={styles.btnText}>Send verification code</Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
  fieldWrap: { marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '500', color: TEXT_GREY, marginBottom: 8 },
  phoneWrap: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    overflow: 'hidden',
  },
  phoneWrapError: { borderColor: ERROR },
  phoneContainer: { width: '100%', backgroundColor: BG, borderRadius: 8, height: 52 },
  phoneTextContainer: { backgroundColor: BG, paddingVertical: 0, height: 52 },
  phoneTextInput: { color: TEXT_DARK, fontSize: 15, height: 52, margin: 0 },
  phoneCodeText: { color: TEXT_DARK, fontSize: 15 },
  phoneFlagBtn: { backgroundColor: BG },
  errorText: { fontSize: 12, color: ERROR, marginTop: 5 },
  btn: {
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  btnDisabled: { backgroundColor: '#A8C4BB' },
  btnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: 14, color: TEXT_GREY },
  footerLink: { fontSize: 14, fontWeight: '600', color: PRIMARY },
});
