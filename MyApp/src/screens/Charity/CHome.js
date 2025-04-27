import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const CHomeScreen = () => {


    return (
        <View style={styles.container}>
         <Text>Charity Home Screen</Text>
        </View>
    );
};

export default CHomeScreen;

const styles = StyleSheet.create({
    container: {
        marginTop:40,
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
   
});
