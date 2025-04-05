import React from "react";
import { Text, View, StyleSheet } from 'react-native';

const RSearchScreen = () => {
    return (
        <View style={styles.container}> 
            <Text>Restaurant Search Screen</Text>
            <Text>Restaurant Search Screen</Text>
            <Text>Restaurant Search Screen</Text>
            <Text>Restaurant Search Screen</Text>
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

export default RSearchScreen;
