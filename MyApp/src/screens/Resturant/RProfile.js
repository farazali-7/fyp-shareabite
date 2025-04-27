import React from "react";
import { Text, View, StyleSheet } from 'react-native';

const RProfileScreen = () => { 
    return (
        <View style={styles.container}> 
            <Text>Restaurant Edit Profile Screen</Text>
            <Text>Restaurant Edit Profile Screen</Text>
            <Text>Restaurant Edit Profile Screen</Text>
            <Text>Restaurant Edit Profile Screen</Text>
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

export default RProfileScreen;