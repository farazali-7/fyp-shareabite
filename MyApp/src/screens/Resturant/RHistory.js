import React from "react";
import { Text, View, StyleSheet } from 'react-native';

const RHistoryScreen = () => { 
    return (
        <View style={styles.container}> 
            <Text>Restaurant History Screen Screen</Text>
            <Text>Restaurant History Screen Screen</Text>
            <Text>Restaurant History Screen Screen</Text>
            <Text>Restaurant History Screen Screen</Text>
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

export default RHistoryScreen;
