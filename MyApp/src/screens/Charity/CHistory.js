import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';

export default function CHistoryScreen() {
  const adminInfo = {
    name: 'Admin',
    email: 'admin@shareabite.com',
    phone: '+92 000 0000000',
    address: '123-A Food Street, Gulberg III, Lahore, Pakistan',
    website: 'https://www.shareabite.org',
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Contact Us</Text>
      <Text style={styles.subText}>
        We're here to help! Reach out to the ShareAbite team anytime.
      </Text>

      <View style={styles.card}>
        <FontAwesome name="envelope" size={24} color="#356F59" />
        <View style={styles.info}>
          <Text style={styles.label}>Email</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${adminInfo.email}`)}>
            <Text style={styles.text}>{adminInfo.email}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <MaterialIcons name="phone" size={24} color="#356F59" />
        <View style={styles.info}>
          <Text style={styles.label}>Phone</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${adminInfo.phone}`)}>
            <Text style={styles.text}>{adminInfo.phone}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Entypo name="location-pin" size={24} color="#356F59" />
        <View style={styles.info}>
          <Text style={styles.label}>Office Address</Text>
          <Text style={styles.text}>{adminInfo.address}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <FontAwesome name="globe" size={24} color="#356F59" />
        <View style={styles.info}>
          <Text style={styles.label}>Website</Text>
          <TouchableOpacity onPress={() => Linking.openURL(adminInfo.website)}>
            <Text style={styles.text}>{adminInfo.website.replace('https://', '')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footer}>Thank you for supporting our mission</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  header: {
    backgroundColor:'#356F59',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#000099',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#356F59',
    elevation: 2,
  },
  info: {
    marginLeft: 14,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000099',
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: '#333',
  },
  footer: {
    marginTop: 40,
    fontSize: 14,
    textAlign: 'center',
    color: '#356F59',
    fontStyle: 'italic',
  },
});


