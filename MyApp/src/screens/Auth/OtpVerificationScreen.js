import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { getAuth, signInWithPhoneNumber } from 'firebase/auth';
import firebaseApp from '../../../firebaseConfig';

const auth = getAuth(firebaseApp);

const PRIMARY    = '#356F59';
const TEXT_DARK  = '#1C1C1E';
const TEXT_GREY  = '#6B6B6B';
const TEXT_LIGHT = '#ABABAB';
const BORDER     = '#E2E2E2';
const ERROR      = '#D32F2F';
const BG         = '#FFFFFF';

const OTP_LENGTH      = 6;
const RESEND_TIMEOUT  = 60;
const MAX_RESEND      = 3;

function maskPhone(phone = '') {
  if (phone.length < 6) return phone;
  const last3 = phone.slice(-3);
  const code  = phone.startsWith('+') ? phone.slice(0, 3) : '';
  return `${code} ••• ••• ${last3}`;
}

export default function OTPVerificationScreen({ navigation, route }) {
  const { contactNumber, flow, ...rest } = route.params;

  const recaptchaRef      = useRef(null);
  const inputRefs         = useRef([...Array(OTP_LENGTH)].map(() => React.createRef()));
  // Ref mirrors confirmation state — avoids stale closure in verify()
  const confirmationRef   = useRef(null);
  // If user fills digits while OTP is still sending, queue the code here
  const pendingCodeRef    = useRef(null);

  const [digits,       setDigits]       = useState(Array(OTP_LENGTH).fill(''));
  const [loading,      setLoading]      = useState(false);
  const [sending,      setSending]      = useState(false);
  const [timer,        setTimer]        = useState(RESEND_TIMEOUT);
  const [resendCount,  setResendCount]  = useState(0);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [sendError,    setSendError]    = useState('');  // persists, not cleared on typing
  const [verified,     setVerified]     = useState(false);
  const [focusedBox,   setFocusedBox]   = useState(0);

  const shakeX = useRef(new Animated.Value(0)).current;

  // Countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Auto-send OTP on mount
  useEffect(() => {
    const id = setTimeout(() => {
      if (recaptchaRef.current) sendOTP();
    }, 300);
    return () => clearTimeout(id);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0,  duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const sendOTP = async () => {
    if (sending) return;
    setSending(true);
    setSendError('');
    setErrorMsg('');
    try {
      if (!contactNumber.startsWith('+')) {
        setSendError('Phone number must include country code.');
        return;
      }
      const result = await signInWithPhoneNumber(auth, contactNumber, recaptchaRef.current);
      // Store in both ref (immediate) and state (for re-renders)
      confirmationRef.current = result;
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimer(RESEND_TIMEOUT);

      // If user already typed the full code while we were sending, verify now
      if (pendingCodeRef.current) {
        const code = pendingCodeRef.current;
        pendingCodeRef.current = null;
        verify(code, result);
      } else {
        setTimeout(() => inputRefs.current[0]?.current?.focus(), 100);
      }
    } catch (_) {
      setSendError('Failed to send OTP. Check your number and try again.');
    } finally {
      setSending(false);
    }
  };

  const handleResend = () => {
    if (resendCount >= MAX_RESEND) {
      setSendError('Too many attempts. Please go back and try again.');
      return;
    }
    setResendCount(c => c + 1);
    confirmationRef.current = null;
    sendOTP();
  };

  // Accept optional confirmationOverride for the pending-code case
  const verify = async (code, confirmationOverride) => {
    const conf = confirmationOverride ?? confirmationRef.current;
    if (!conf) {
      // OTP still sending — queue the code, verify will run once sendOTP completes
      pendingCodeRef.current = code;
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await conf.confirm(code);
      setVerified(true);
      setTimeout(() => {
        if (flow === 'register') {
          navigation.navigate('SetPassword', { contactNumber: result.user.phoneNumber, ...rest });
        } else if (flow === 'forgot') {
          navigation.navigate('ResetPassword', { contactNumber: result.user.phoneNumber });
        }
      }, 400);
    } catch (e) {
      setDigits(Array(OTP_LENGTH).fill(''));
      pendingCodeRef.current = null;
      setTimeout(() => inputRefs.current[0]?.current?.focus(), 50);
      shake();
      if (e.code === 'auth/code-expired') {
        setErrorMsg('Code expired. Tap Resend to get a new one.');
      } else if (e.code === 'auth/invalid-verification-code') {
        setErrorMsg('Incorrect code. Please try again.');
      } else {
        setErrorMsg('Verification failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value, index) => {
    // Handle paste
    if (value.length > 1) {
      const clean = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const next  = [...Array(OTP_LENGTH).fill('')];
      clean.split('').forEach((ch, i) => { next[i] = ch; });
      setDigits(next);
      setErrorMsg('');
      if (clean.length === OTP_LENGTH) {
        inputRefs.current[OTP_LENGTH - 1]?.current?.blur();
        verify(clean);
      } else {
        inputRefs.current[Math.min(clean.length, OTP_LENGTH - 1)]?.current?.focus();
      }
      return;
    }

    const ch = value.replace(/\D/g, '');
    const next = [...digits];
    next[index] = ch;
    setDigits(next);
    setErrorMsg('');

    if (ch && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.current?.focus();
    }
    if (ch && next.every(d => d !== '')) {
      inputRefs.current[OTP_LENGTH - 1]?.current?.blur();
      verify(next.join(''));
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputRefs.current[index - 1]?.current?.focus();
    }
  };

  const boxBorder = (i) => {
    if (verified)      return PRIMARY;
    if (errorMsg)      return ERROR;
    if (focusedBox === i && digits[i]) return PRIMARY;
    if (digits[i])     return TEXT_DARK;
    if (focusedBox === i) return PRIMARY;
    return BORDER;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseApp.options}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.heading}>Enter the code</Text>
            <Text style={styles.subText}>
              Sent to <Text style={styles.phone}>{maskPhone(contactNumber)}</Text>
            </Text>
          </View>

          {/* OTP boxes */}
          <Animated.View style={[styles.boxRow, { transform: [{ translateX: shakeX }] }]}>
            {digits.map((digit, i) => (
              <View
                key={i}
                style={[styles.box, { borderColor: boxBorder(i) }]}
              >
                <TextInput
                  ref={inputRefs.current[i]}
                  style={[
                    styles.boxInput,
                    errorMsg ? styles.boxInputError : null,
                    verified  ? styles.boxInputVerified : null,
                  ]}
                  value={digit}
                  onChangeText={v => handleChange(v, i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                  onFocus={() => setFocusedBox(i)}
                  onBlur={() => setFocusedBox(-1)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  selectTextOnFocus
                  editable={!loading && !verified}
                  caretHidden
                  textAlign="center"
                />
              </View>
            ))}
          </Animated.View>

          {/* Status */}
          <View style={styles.statusRow}>
            {sending && !loading && (
              <View style={styles.verifyingRow}>
                <ActivityIndicator size="small" color={TEXT_GREY} />
                <Text style={styles.verifyingText}>Sending code…</Text>
              </View>
            )}
            {loading && (
              <View style={styles.verifyingRow}>
                <ActivityIndicator size="small" color={PRIMARY} />
                <Text style={styles.verifyingText}>Verifying</Text>
              </View>
            )}
            {!!sendError && !sending && (
              <Text style={styles.errorText}>{sendError}</Text>
            )}
            {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            {verified && <Text style={styles.successText}>Verified</Text>}
          </View>

          {/* Timer / Resend */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend code in 0:{String(timer).padStart(2, '0')}
              </Text>
            ) : sending ? (
              <ActivityIndicator size="small" color={TEXT_GREY} />
            ) : resendCount >= MAX_RESEND ? (
              <Text style={styles.timerText}>Too many attempts. Go back and try again.</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendText}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.hintText}>
            SMS can take up to a minute. Check your spam folder if needed.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    marginBottom: 32,
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_DARK,
  },
  header: {
    marginBottom: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: TEXT_GREY,
    lineHeight: 22,
  },
  phone: {
    fontWeight: '600',
    color: TEXT_DARK,
  },
  boxRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  box: {
    flex: 1,
    height: 54,
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  boxInput: {
    width: '100%',
    height: '100%',
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
    padding: 0,
  },
  boxInputError: {
    color: ERROR,
  },
  boxInputVerified: {
    color: PRIMARY,
  },
  statusRow: {
    minHeight: 24,
    marginBottom: 20,
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyingText: {
    fontSize: 14,
    color: TEXT_GREY,
  },
  errorText: {
    fontSize: 13,
    color: ERROR,
  },
  successText: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
  },
  resendRow: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: TEXT_GREY,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  hintText: {
    fontSize: 12,
    color: TEXT_LIGHT,
    lineHeight: 18,
  },
});
