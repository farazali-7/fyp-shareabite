import React from 'react'
import { Text , View } from 'react-native'
import { FontAwesome , AntDesign , Ionicons ,Entypo } from '@expo/vector-icons';


export default function ResturantHomeScreen(){

return(
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Welcome to the App!</Text>
    <AntDesign name="home" size={30} color="#900" />
    <FontAwesome name="home" size={30} color="#900" />
    <Ionicons name="home" size={30} color="#900"/>
    <Ionicons name="home-outline" size={30} color="#900"/>
</View>
)
}