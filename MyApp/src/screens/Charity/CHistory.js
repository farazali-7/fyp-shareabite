import React from "react";
import { Text, View, StyleSheet } from 'react-native';

const CHistoryScreen = () => { 
    return (
        <View style={styles.container}> 
            <Text>Charity History Screen Screen</Text>
            <Text>Charity History Screen Screen</Text>
            <Text>Charity History Screen Screen</Text>
            <Text>Charity History Screen Screen</Text>
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

export default CHistoryScreen;
