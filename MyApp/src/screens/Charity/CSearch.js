import React from "react";
import { Text, View, StyleSheet } from 'react-native';

const CSearchScreen = () => {
    return (
        <View style={styles.container}> 
            <Text>Charity Search Screen</Text>
            <Text>Charity Search Screen</Text>
            <Text>Charity Search Screen</Text>
            <Text>Charity Search Screen</Text>
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

export default CSearchScreen;
