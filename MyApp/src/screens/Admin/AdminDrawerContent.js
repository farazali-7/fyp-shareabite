import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Drawer Menu Items
const drawerList = [
  {
    icon: { name: "sign-out", library: FontAwesome },
    label: "Logout",
    action: "logout",
  },
];

// Drawer Menu Button
const DrawerMenuItem = ({ icon, label, navigateTo, action }) => {
  const navigation = useNavigation();
  const IconComponent = icon.library;

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      navigation.reset({
        index: 0,
        routes: [{ name: "AuthStack" }],
      });
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const handlePress = () => {
    if (action === "logout") {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", onPress: handleLogout },
        ],
        { cancelable: true }
      );
    } else if (navigateTo) {
      navigation.navigate(navigateTo);
    }
  };

  return (
    <DrawerItem
      icon={({ color, size }) => (
        <IconComponent name={icon.name} color={color} size={size} />
      )}
      label={label}
      onPress={handlePress}
    />
  );
};

function AdminDrawerContent(props) {
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.drawerSection}>
            {drawerList.map((item, index) => (
              <DrawerMenuItem
                key={index}
                icon={item.icon}
                label={item.label}
                navigateTo={item.navigateTo}
                action={item.action}
              />
            ))}
          </View>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerSection: {
    marginTop: 15,
  },
});

export default AdminDrawerContent;
