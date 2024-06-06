import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function More() {
    const [selectedImage, setSelectedImage] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        })();
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedImageUri = result.assets[0].uri;
            console.log('Selected Image URI:', selectedImageUri);
            navigation.navigate('Diagnose', { imageUri: selectedImageUri });
        } else {
            console.log('Image selection was canceled');
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <TouchableOpacity style={styles.topButton} onPress={() => navigation.navigate('Diagnose')}>
                    <FontAwesome name="camera" size={40} color="white" />
                    <Text style={styles.topButtonText}>Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topButton} onPress={pickImage}>
                    <FontAwesome name="image" size={40} color="white" />
                    <Text style={styles.topButtonText}>Image</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.mainTitle}>Explore by Identifying</Text>
            <View style={styles.grid}>
                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Objectdetection')}>
                    <FontAwesome name="bullseye" size={48} color="#00E676" />
                    <Text style={styles.gridText}>Object Detection</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}>
                    <FontAwesome name="bug" size={48} color="#00E676" />
                    <Text style={styles.gridText}>Insect Identification</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Diagnose')}>
                    <FontAwesome name="leaf" size={48} color="#00E676" />
                    <Text style={styles.gridText}>Compost Diagnosis</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridItem}>
                    <FontAwesome name="tree" size={48} color="#00E676" />
                    <Text style={styles.gridText}>My Compost</Text>
                </TouchableOpacity>
            </View>
            {selectedImage && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.image} />
                    <Text style={styles.overlayText}>Object Detected!</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: '#333',
        paddingVertical: 20,
        paddingBottom: 20,
        marginTop: 40,
    },
    topButton: {
        alignItems: 'center',
    },
    topButtonText: {
        color: 'white',
        marginTop: 5,
    },
    mainTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    gridItem: {
        width: '40%',
        height: 150,
        backgroundColor: '#222',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    gridText: {
        color: 'white',
        marginTop: 10,
        textAlign: 'center',
    },
    imageContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
    },
    overlayText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 10,
    },
});
