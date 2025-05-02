import React from "react";
import { View, Text, StyleSheet } from "react-native";

const RNotificationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Notifications are only displayed for Charity Houses.
      </Text>
    </View>
  );
};

export default RNotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    color: "#000099",
    textAlign: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#00CCCC",
    paddingLeft: 12,
    lineHeight: 24,
  },
});
