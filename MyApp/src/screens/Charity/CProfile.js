import React from "react";
import { Text, View, StyleSheet } from 'react-native';

const CProfileScreen = () => { 
    return (
        <View style={styles.container}> 
            <Text>Charity Profile Screen</Text>
            <Text>Charity Profile Screen</Text>
            <Text>Charity Profile Screen</Text>
            <Text>Charity Profile Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    }
});

export default CProfileScreen;
