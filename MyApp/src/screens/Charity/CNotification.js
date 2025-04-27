import React from "react";
import { Text, View, StyleSheet } from 'react-native';

const CNotificationScreen = () => { 
    return (
        <View style={styles.container}> 
            <Text>Charity NotificationScreen Screen</Text>
            <Text>Charity NotificationScreen Screen</Text>
            <Text>Charity NotificationScreen Screen</Text>
            <Text>Charity NotificationScreen Screen</Text>
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

export default CNotificationScreen;
