import React, { useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons
import * as Progress from 'react-native-progress'; // Import Progress from react-native-progress
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

export default function ObjectDetection() {
    const [permission, requestPermission] = useCameraPermissions();
    const [showObjects, setShowObjects] = useState(false);
    const [pictureTaken, setPictureTaken] = useState(false);
    const [capturedImageURI, setCapturedImageURI] = useState(null);
    const [detectedObjects, setDetectedObjects] = useState([]);
    const [croppedImages, setCroppedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const cameraRef = useRef(null);
    const navigation = useNavigation();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    function takePicture() {
        if (cameraRef.current) {
            cameraRef.current.takePictureAsync()
                .then((data) => {
                    setPictureTaken(true);
                    setCapturedImageURI(data.uri);

                    // Call detect API with captured image
                    detectObjects(data.uri);
                })
                .catch((error) => {
                    console.log('Error taking picture:', error);
                });
        }
    }

    function detectObjects(imageUri) {
        setLoading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: 'image.png',
            type: 'image/png',
        });

        fetch('http://192.168.0.103:9191/detect/', {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Response:', data);
                if (data.descriptions && Array.isArray(data.descriptions)) {
                    setDetectedObjects(data.descriptions);
                } else {
                    console.log('No objects detected');
                    setDetectedObjects([]);
                }
                if (data.cropped_images && Array.isArray(data.cropped_images)) {
                    console.log('inside cropped array set');
                    setCroppedImages(data.cropped_images);
                } else {
                    console.log('No cropped images');
                    setCroppedImages([]);
                }
                setLoading(false);
                setShowObjects(true);
            })
            .catch((error) => {
                console.error('Error:', error);
                setLoading(false);
            });

        // Simulate progress
        let progressValue = 0;
        const interval = setInterval(() => {
            progressValue += 0.1;
            if (progressValue >= 1) {
                progressValue = 1;
                clearInterval(interval);
            }
            setProgress(progressValue);
        }, 300);
    }

    function retakePicture() {
        setPictureTaken(false);
        setShowObjects(false);
        setCapturedImageURI(null);
        setDetectedObjects([]);
        setCroppedImages([]);
    }

    return (
        <View style={styles.container}>
            <View style={styles.cameraContainer}>
                {capturedImageURI ? (
                    <Image source={{ uri: capturedImageURI }} style={styles.capturedImage} />
                ) : (
                    <CameraView style={styles.camera} ref={cameraRef} />
                )}
            </View>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Detecting... {Math.round(progress * 100)}%</Text>
                    <Progress.Bar progress={progress} width={300} height={20} color="#007AFF" />
                </View>
            )}
            {pictureTaken && !loading && (
                <View style={styles.sectionsContainer}>
                    <ScrollView>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Detected Objects</Text>
                            {showObjects && detectedObjects.length > 0 ? (
                                <View style={styles.itemContainer}>
                                    {detectedObjects.map((description, index) => (
                                        <View key={index} style={[styles.itemBox, { backgroundColor: '#7A7458' }]}>
                                            <Text style={styles.itemText}>{description}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.sectionTitlenoObj}>No Objects Detected</Text>
                            )}
                        </View>
                    </ScrollView>
                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={retakePicture} style={styles.iconButton}>
                            <FontAwesome name="camera-retro" size={48} color="#28C878" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('More')} style={styles.iconButton}>
                            <FontAwesome name="home" size={48} color="#E14364" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {!pictureTaken && !loading && (
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                    <Text style={styles.captureButtonText}>Take Picture</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    camera: {
        flex: 1,
    },
    capturedImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    sectionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        padding: 20,
        width: '100%', // Ensure section occupies full width
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionTitlenoObj: {
        fontSize: 18,
        marginBottom: 10,
    },
    contentText: {
        fontSize: 18,
        textAlign: 'center',
    },
    captureButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    captureButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    iconButton: {
        marginHorizontal: 20,
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 100, // Position the loader towards the bottom
        left: '50%',
        transform: [{ translateX: -150 }], // Adjust based on new width
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    arrowList: {
        marginTop: 10,
    },
    arrowItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowText: {
        marginLeft: 10,
        fontSize: 18,
        color: '#007AFF',
    },
    itemContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemBox: {
        width: '100%', // Adjust width as needed
        marginVertical: 10,
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 18,
        color: '#FFF',
        textAlign: 'center',
    },
});
