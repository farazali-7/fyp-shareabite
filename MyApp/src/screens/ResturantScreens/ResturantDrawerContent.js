import React from "react";
import { View, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';


const drawerList = [
    { icon: { name: 'home', library: AntDesign }, label: 'ResturantProfile', navigateTo: 'ResturantProfile' },

    { icon: { name: 'home', library: AntDesign }, label: 'ResturantScreen', navigateTo: 'ResturantScreen' },
    { icon: { name: 'users', library: FontAwesome }, label: 'ResturantContact', navigateTo: 'ResturantContact' },

];


const DrawerLayout = ({ icon, label, navigateTo }) => {
  const navigation = useNavigation();
  
  const IconComponent = icon.library;

  return (
    <DrawerItem
      icon={({ color, size }) => <IconComponent name={icon.name} color={color} size={size} />}
      label={label}
      onPress={() => navigation.navigate(navigateTo)}
    />
  );
}

const DrawerItems = () => {
  return drawerList.map((item, index) => (
    <DrawerLayout
      key={index}
      icon={item.icon}
      label={item.label}
      navigateTo={item.navigateTo}
    />
  ));
}

function DrawerContent(props) {
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
         {/* <DrawerItem  icon={({color , size})=><AntDesign name="logout" color={color} size={size} /> }
          label="sign out"
          onPress={handlelogout}  />*/}
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
  }
});

export default DrawerContent;
