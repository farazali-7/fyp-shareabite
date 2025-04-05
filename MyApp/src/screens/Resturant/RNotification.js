import React from "react";
import { Text, View, StyleSheet } from 'react-native';

const RNotificationScreen = () => { 
    return (
        <View style={styles.container}> 
            <Text>Restaurant NotificationScreen Screen</Text>
            <Text>Restaurant NotificationScreen Screen</Text>
            <Text>Restaurant NotificationScreen Screen</Text>
            <Text>Restaurant NotificationScreen Screen</Text>
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

export default RNotificationScreen;
