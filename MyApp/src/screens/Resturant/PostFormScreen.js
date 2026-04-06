import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { createFoodPost } from '../../apis/userAPI';

const DURATION_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '2 hours', hours: 2 },
  { label: '4 hours', hours: 4 },
  { label: '6 hours', hours: 6 },
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
];

const UNIT_OPTIONS = ['servings', 'kg', 'packs', 'boxes', 'liters'];

export default function PostFormScreen() {
  const navigation = useNavigation();

  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('servings');
  const [selectedHours, setSelectedHours] = useState(null);
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!foodType.trim()) e.foodType = 'Required';
    if (!quantity.trim() || isNaN(Number(quantity))) e.quantity = 'Enter a valid number';
    if (!selectedHours) e.duration = 'Select how long it\'s available';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem('user');
      const user = JSON.parse(storedUser);

      const bestBefore = new Date(Date.now() + selectedHours * 3600000).toISOString();

      const formData = new FormData();
      formData.append('foodType', foodType.trim());
      formData.append('quantity', quantity.trim());
      formData.append('quantityUnit', quantityUnit);
      formData.append('bestBefore', bestBefore);
      formData.append('area', area.trim());
      formData.append('description', description.trim());
      formData.append('createdBy', user._id);

      await createFoodPost(formData);

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Could not create post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children, error }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtn}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Food</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator size="small" color="#356F59" />
            : <Text style={styles.postBtn}>Post</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Food type *" error={errors.foodType}>
          <TextInput
            style={[styles.input, errors.foodType && styles.inputError]}
            placeholder="e.g. Biryani, Bread, Mixed vegetables"
            placeholderTextColor="#ABABAB"
            value={foodType}
            onChangeText={(t) => { setFoodType(t); setErrors(e => ({ ...e, foodType: '' })); }}
            autoCapitalize="words"
          />
        </Field>

        <Field label="Quantity *" error={errors.quantity}>
          <View style={styles.quantityRow}>
            <TextInput
              style={[styles.input, styles.quantityInput, errors.quantity && styles.inputError]}
              placeholder="e.g. 5"
              placeholderTextColor="#ABABAB"
              value={quantity}
              onChangeText={(t) => { setQuantity(t); setErrors(e => ({ ...e, quantity: '' })); }}
              keyboardType="numeric"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
              {UNIT_OPTIONS.map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.unitPill, quantityUnit === unit && styles.unitPillActive]}
                  onPress={() => setQuantityUnit(unit)}
                >
                  <Text style={[styles.unitPillText, quantityUnit === unit && styles.unitPillTextActive]}>
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Field>

        <Field label="Available for *" error={errors.duration}>
          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.hours}
                style={[
                  styles.durationPill,
                  selectedHours === opt.hours && styles.durationPillActive,
                  errors.duration && styles.durationPillError,
                ]}
                onPress={() => { setSelectedHours(opt.hours); setErrors(e => ({ ...e, duration: '' })); }}
              >
                <Text style={[
                  styles.durationText,
                  selectedHours === opt.hours && styles.durationTextActive,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Pickup area">
          <TextInput
            style={styles.input}
            placeholder="e.g. Gulshan, Downtown, Near Expo Centre"
            placeholderTextColor="#ABABAB"
            value={area}
            onChangeText={setArea}
            autoCapitalize="words"
          />
        </Field>

        <Field label="Description (optional)">
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any notes for the charity — halal, allergens, packaging, etc."
            placeholderTextColor="#ABABAB"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Field>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  backBtn: {
    fontSize: 15,
    color: '#ABABAB',
  },
  postBtn: {
    fontSize: 15,
    fontWeight: '600',
    color: '#356F59',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fieldWrap: {
    marginTop: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
    marginBottom: 6,
  },
  fieldError: {
    fontSize: 12,
    color: '#E53935',
    marginTop: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1C1C1E',
  },
  inputError: {
    borderColor: '#E53935',
  },
  textArea: {
    height: 88,
    paddingTop: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityInput: {
    width: 80,
  },
  unitScroll: {
    flex: 1,
  },
  unitPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    marginRight: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitPillActive: {
    borderColor: '#356F59',
    backgroundColor: '#E8F1EE',
  },
  unitPillText: {
    fontSize: 14,
    color: '#ABABAB',
  },
  unitPillTextActive: {
    color: '#356F59',
    fontWeight: '500',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  durationPillActive: {
    borderColor: '#356F59',
    backgroundColor: '#E8F1EE',
  },
  durationPillError: {
    borderColor: '#FEECEC',
  },
  durationText: {
    fontSize: 14,
    color: '#ABABAB',
  },
  durationTextActive: {
    color: '#356F59',
    fontWeight: '500',
  },
});
