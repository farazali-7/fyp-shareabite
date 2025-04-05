import React from "react";
import { Text, View, StyleSheet } from 'react-native';
import { Button } from "react-native";
import { useNavigation } from '@react-navigation/native';

const TestingScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}> 
            <Text>Restaurant HOME Screen</Text>
            <Text>Restaurant HOME Screen</Text>
            <Text>Restaurant HOME Screen</Text>
            <Text>Restaurant HOME Screen</Text>
            <Button
  title="Go to History"
  onPress={() => navigation.navigate('History')}
/>
<Button
  title="Go to EditProfile"
  onPress={() => navigation.navigate('EditProfile')}
/>

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

export default TestingScreen;
