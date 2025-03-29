import React, { useState ,useRef} from 'react';
import { View, Button, Alert, StyleSheet, Text } from 'react-native';
import PhoneInput from "react-native-phone-number-input";

export default function ForgotPasswordScreen({  navigation }) {
    const [contactNumber, setContactNumber] = useState('');
     const phoneInput = useRef(null);
     const [error, setError] = useState("");

    const handleSubmit=()=>{
        if(!contactNumber){
            return Alert.alert("Plaese Enter the accurate contact number");
        }
        const isValid = phoneInput.current?.isValidNumber(contactNumber);
        if (!isValid) {
            return Alert.alert("Invalid phone number format");
        }

        navigation.navigate("OtpVerification" , {
            flow:"forgot", 
            contactNumber
        })
       }
    return (
        <View style={styles.container}>
            <Text>Enter your Registered Account Number </Text>
            <PhoneInput
                ref={phoneInput}
                defaultCode="PK"  
                layout="first"
                onChangeFormattedText={(text) => {
                    setContactNumber(text);  
                }}
                withDarkTheme
                autoFocus
            />
                 {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
              
            <Button title='Next' onPress={handleSubmit} /> 
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, justifyContent: 'center' },
    input: {
        borderBottomWidth: 1,
        marginBottom: 15,
        padding: 10,
        fontSize: 16,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
});
