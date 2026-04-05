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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PhoneInput from 'react-native-phone-number-input';
import { checkUserExists } from '../../apis/userAPI';

const PRIMARY    = '#356F59';
const TEXT_DARK  = '#1C1C1E';
const TEXT_GREY  = '#6B6B6B';
const TEXT_LIGHT = '#ABABAB';
const BORDER     = '#E2E2E2';
const ERROR      = '#D32F2F';
const BG         = '#FFFFFF';

const ROLES = [
  { label: 'Eatery',        value: 'Eatery'       },
  { label: 'Charity House', value: 'Charity House' },
];

export default function Register({ navigation }) {
  const [role,          setRole]          = useState(null);
  const [userName,      setUserName]      = useState('');
  const [email,         setEmail]         = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [licenseImage,  setLicenseImage]  = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [errors,        setErrors]        = useState({});

  const phoneRef = useRef(null);
  const emailRef = useRef(null);

  const setFieldError = (field, msg) => setErrors(prev => ({ ...prev, [field]: msg }));
  const clearError    = (field)       => setErrors(prev => { const e = { ...prev }; delete e[field]; delete e.general; return e; });

  const validate = () => {
    const e = {};
    if (!role)
      e.role = 'Select your account type.';
    if (!userName.trim())
      e.userName = 'Username is required.';
    else if (userName.trim().length < 3)
      e.userName = 'At least 3 characters.';
    else if (!/^[a-zA-Z0-9_-]+$/.test(userName.trim()))
      e.userName = 'Letters, numbers, _ and - only.';
    if (!email.trim())
      e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Enter a valid email.';
    if (!contactNumber || contactNumber.replace(/\D/g, '').length < 10)
      e.phone = 'Enter a valid phone number.';
    if (!licenseImage)
      e.license = 'Upload your business license.';
    return e;
  };

  const handleContinue = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const exists = await checkUserExists({ email: email.trim(), contactNumber });
      if (exists === true) {
        setErrors({ general: 'An account with this email or phone already exists.' });
        return;
      }
      navigation.navigate('OtpVerification', {
        flow:          'register',
        role:          role === 'Eatery' ? 'restaurant' : 'charity',
        userName:      userName.trim(),
        email:         email.trim(),
        contactNumber,
        licenseImage,
      });
    } catch (_) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const pickLicense = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.assets?.length) return;
    setLicenseImage(result.assets[0].uri);
    clearError('license');
  };

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
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.heading}>Create account</Text>
            <Text style={styles.subHeading}>Fill in your details to get started</Text>
          </View>

          {/* Role */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>I am a</Text>
            <View style={styles.roleRow}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleTab, role === r.value && styles.roleTabActive]}
                  onPress={() => { setRole(r.value); clearError('role'); }}
                  activeOpacity={0.65}
                >
                  <Text style={[styles.roleTabText, role === r.value && styles.roleTabTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {!!errors.role && <Text style={styles.fieldError}>{errors.role}</Text>}
          </View>

          {/* Username */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, !!errors.userName && styles.inputError]}
              placeholder="e.g. john_doe"
              placeholderTextColor={TEXT_LIGHT}
              value={userName}
              onChangeText={t => { setUserName(t); clearError('userName'); }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              maxLength={20}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            {!!errors.userName && <Text style={styles.fieldError}>{errors.userName}</Text>}
          </View>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, !!errors.email && styles.inputError]}
              placeholder="you@example.com"
              placeholderTextColor={TEXT_LIGHT}
              value={email}
              onChangeText={t => { setEmail(t); clearError('email'); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            {!!errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Phone number</Text>
            <View style={[styles.phoneWrap, !!errors.phone && styles.inputError]}>
              <PhoneInput
                ref={phoneRef}
                defaultCode="PK"
                layout="first"
                onChangeFormattedText={t => { setContactNumber(t); clearError('phone'); }}
                containerStyle={styles.phoneContainer}
                textContainerStyle={styles.phoneTextContainer}
                textInputStyle={styles.phoneTextInput}
                codeTextStyle={styles.phoneCodeText}
                flagButtonStyle={styles.phoneFlagBtn}
                withDarkTheme={false}
                withShadow={false}
              />
            </View>
            {!!errors.phone && <Text style={styles.fieldError}>{errors.phone}</Text>}
          </View>

          {/* License */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Business license</Text>
            <TouchableOpacity
              style={[styles.uploadArea, !!errors.license && styles.inputError]}
              onPress={pickLicense}
              activeOpacity={0.7}
            >
              {licenseImage ? (
                <View>
                  <Image source={{ uri: licenseImage }} style={styles.licensePreview} resizeMode="cover" />
                  <Text style={styles.uploadChangeText}>Tap to change</Text>
                </View>
              ) : (
                <Text style={styles.uploadPlaceholder}>Tap to upload license image</Text>
              )}
            </TouchableOpacity>
            {!!errors.license && <Text style={styles.fieldError}>{errors.license}</Text>}
          </View>

          {/* General error */}
          {!!errors.general && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{errors.general}</Text>
              {errors.general.includes('already exists') && (
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.errorBoxLink}>Sign in instead</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Terms */}
          <Text style={styles.termsText}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text style={styles.btnText}>Continue</Text>
            }
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
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
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 24,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 15,
    color: TEXT_DARK,
    fontWeight: '500',
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
  fieldWrap: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_GREY,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleTab: {
    flex: 1,
    height: 44,
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
    fontSize: 14,
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
  inputError: {
    borderColor: ERROR,
  },
  phoneWrap: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    overflow: 'hidden',
  },
  phoneContainer: {
    width: '100%',
    backgroundColor: BG,
    borderRadius: 8,
    height: 52,
  },
  phoneTextContainer: {
    backgroundColor: BG,
    paddingVertical: 0,
    height: 52,
  },
  phoneTextInput: {
    color: TEXT_DARK,
    fontSize: 15,
    height: 52,
    margin: 0,
  },
  phoneCodeText: {
    color: TEXT_DARK,
    fontSize: 15,
  },
  phoneFlagBtn: {
    backgroundColor: BG,
  },
  uploadArea: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    fontSize: 14,
    color: TEXT_LIGHT,
    paddingVertical: 28,
  },
  licensePreview: {
    width: '100%',
    height: 140,
  },
  uploadChangeText: {
    fontSize: 12,
    color: TEXT_GREY,
    textAlign: 'center',
    paddingVertical: 8,
  },
  fieldError: {
    fontSize: 12,
    color: ERROR,
    marginTop: 5,
  },
  errorBox: {
    borderWidth: 1,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxText: {
    fontSize: 13,
    color: ERROR,
  },
  errorBoxLink: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
    marginTop: 6,
  },
  termsText: {
    fontSize: 12,
    color: TEXT_LIGHT,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
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
