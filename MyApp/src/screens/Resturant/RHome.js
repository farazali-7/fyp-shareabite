import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { FAB } from 'react-native-paper';
import PostCard from './PostCard';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';

const RHomeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [posts, setPosts] = useState([
        {
            id: '1',
            userName: 'Biryani Point',
            images: ['https://kfoods.com/images1/newrecipeicon/chicken-biryani_3.jpg', 'https://media.istockphoto.com/id/501150349/photo/chicken-biryani-11.jpg?s=612x612&w=0&k=20&c=w6mDnUx8MnH3rnP9bR0VfWRwrODcbTz-6U07o3Zrs4o=','https://i.ytimg.com/vi/h_WgCE3XSxI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD2WexJs03ZNf1jPIez1q-GqGIAng' ,'https://www.shutterstock.com/shutterstock/videos/1104174649/thumb/1.jpg?ip=x480' ],
            foodType: 'Biryani',
            quantity: '4 people',
            bestBefore: '2025-04-07',
            latitude: 31.5204,
            longitude: 74.3587,
            description: 'Freshly cooked biryani available for pick-up.',
        },
        {
            id: '1',
            userName: ' Deserts Point',
            images: ['https://ent.news/2025/3/2139.jpg'], 
            foodType: 'Deserts',
            quantity: '4 people',
            bestBefore: '2025-04-07',
            latitude: 31.5204,
            longitude: 74.3587,
            description: 'Freshly cooked biryani available for pick-up.',
        },
        {
            id: '10',
            userName: 'Barbq Point',
            images: ['https://www.shutterstock.com/image-photo/food-bar-b-q-pakistani-260nw-1885378774.jpg'],
            foodType: 'Barbq',
            quantity: '5 people',
            bestBefore: '2025-04-07',
            latitude: 31.5204,
            longitude: 74.3587,
            description: 'if you are not bar bq lover visit us and bet you will not become',
        },
    ]);

    useFocusEffect(() => {
        if (route.params?.newPost) {
            setPosts((prev) => [route.params.newPost, ...prev]);
        }
    });

    const handleNewPost = () => {
        navigation.navigate('NewPost');
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PostCard post={item} />}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No posts yet.</Text>}
            />
            <FAB style={styles.fab} icon="plus" onPress={handleNewPost} />
        </View>
    );
};

export default RHomeScreen;

const styles = StyleSheet.create({
    container: {
        marginTop:40,
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 16,
        bottom: 16,
        backgroundColor: '#6200ee',
    },
});
