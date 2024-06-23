import React, { useRef, useState, useEffect } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress'; // Import Progress from react-native-progress
import { useRoute } from '@react-navigation/native'; // Add this line


export default function Diagnose() {
    const route = useRoute();
    const [permission, requestPermission] = useCameraPermissions();
    const [showObjects, setShowObjects] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAnalyze, setShowAnalyze] = useState(false); // State for Analyze Compost Health accordion
    const [pictureTaken, setPictureTaken] = useState(false);
    const [capturedImageURI, setCapturedImageURI] = useState(null);
    const [detectedObjects, setDetectedObjects] = useState([]);
    const [croppedImages, setCroppedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [suggestionsHTML, setSuggestionsHTML] = useState([]);
    const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
    const cameraRef = useRef(null);
    const [clsmodalVisible, setCLSModalVisible] = useState(false); // State for modal visibility
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isModel1Active, setIsModel1Active] = useState(true);
    const [isModel2Active, setIsModel2Active] = useState(false);




    useEffect(() => {
        if (route.params?.imageUri && !pictureTaken) {
            const { imageUri } = route.params;
            console.log(route.params?.imageUri);
            setCapturedImageURI(imageUri);
            setPictureTaken(true);
            setLoading(true); // Set loading to true when a new image is selected
            detectObjects(imageUri);
        }
    }, [route.params, pictureTaken]);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
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

    function generateRandomColor() {
        return Math.floor(Math.random() * 16777215).toString(16);
    }

    function getNLPSuggestions(detectedObjectsText, setSuggestionsHTML) {
        // Call the API to generate suggestions
        fetch('http://192.168.0.105:9195/generate?text=' + encodeURIComponent(detectedObjectsText), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("response", data);
                // Check if generated_text exists and is an array
                if (data && Array.isArray(data.generated_text)) {
                    // Parse the generated text into JSX elements
                    const suggestionsHTML = data.generated_text
                        .join('. ') // Join sentences with dots and space
                        .split('. ') // Split by dots and space to get individual sentences
                        .filter(sentence => sentence.trim() !== "") // Remove empty lines
                        .map((sentence, index) => (
                            <View key={index} style={styles.chatBubble}>
                                <Text style={styles.chatText}>{sentence.trim()}</Text>
                            </View>
                        ));
                    // Update the state to show suggestions
                    setSuggestionsHTML(suggestionsHTML); // Set JSX elements directly
                    setShowSuggestions(true);
                    setModalVisible(true); // Show modal with suggestions
                } else {
                    console.error('Invalid response format or missing generated_text:', data);
                    // Handle the case where generated_text is missing or not an array
                }
            })
            .catch((error) => {
                console.error('Error fetching suggestions:', error);
            });
    }

    function analyseCompostHealth(imageUri) {
        setLoading(true);

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: 'image.png',
            type: 'image/png',
        });

        fetch('http://192.168.0.105:9195/predict/', {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Analysis Response:', data);
                setAnalysisResult(data.predictions);
                setLoading(false);
                setCLSModalVisible(true); // Show the modal when analysis results are ready
                setShowAnalysis(true); // Show the analysis result box
            })
            .catch((error) => {
                console.error('Error:', error);
                setLoading(false);
            });
    }

    function detectObjectCustom(imageUri) {
        setLoading(true);

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: 'image.png',
            type: 'image/png',
        });

        fetch('http://192.168.0.105:9100/detect_objects/', {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Custom Object Detection Response:', data);
                setDetectedObjects(data.descriptions); // Set detected objects
                setAnalysisResult(data.predictions); // Set analysis result
                setLoading(false);
                setCLSModalVisible(true); // Show the modal when analysis results are ready
                setShowAnalysis(true); // Show the analysis result box
            })
            .catch((error) => {
                console.error('Error:', error);
                setLoading(false);
            });
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

        fetch('http://192.168.0.105:9195/detect/', {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
                // No need to set Content-Type header for multipart/form-data
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
                // Check if detected_objects is defined and is an array
                if (data.descriptions && Array.isArray(data.descriptions)) {
                    setDetectedObjects(data.descriptions);
                } else {
                    console.log('No objects detected');
                    // Set detectedObjects to an empty array
                    setDetectedObjects([]);
                }
                // Check if cropped_images is defined and is an array
                if (data.cropped_images && Array.isArray(data.cropped_images)) {
                    console.log('inside cropped array set');
                    setCroppedImages(data.cropped_images);
                } else {
                    console.log('No cropped images');
                    // Set croppedImages to an empty array
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
        setShowSuggestions(false);
        setShowAnalyze(false); // Reset Analyze Compost Health accordion
        setCapturedImageURI(null);
        setDetectedObjects([]);
        setCroppedImages([]);
    }

    function getSuggestions() {
        return 'The "View Suggestions" section provides useful tips and recommendations based on the detected objects in your compost. Click the "Suggest" button to get detailed suggestions for improving your compost.';
    }

    function getAnalysis() {
        return 'The "Analyze Compost Health" section evaluates the overall health of your compost based on the detected objects. Click the "Analyze" button for a comprehensive analysis and actionable insights.';
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
                                <View style={styles.card}>
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setIsModel1Active(true);
                                                setIsModel2Active(false);
                                            }}
                                            style={[
                                                styles.modelButton,
                                                isModel1Active ? styles.activeModelButton : styles.inactiveModelButton
                                            ]}
                                        >
                                            <Text style={styles.buttonText}>Model 1</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setIsModel1Active(false);
                                                setIsModel2Active(true);
                                                detectObjectCustom(capturedImageURI); // Call the custom object detect method
                                            }}
                                            style={[
                                                styles.modelButton,
                                                isModel2Active ? styles.activeModelButton : styles.inactiveModelButton
                                            ]}
                                        >
                                            <Text style={styles.buttonText}>Model 2</Text>
                                        </TouchableOpacity>

                                    </View>
                                    <View style={styles.itemContainer}>
                                        {detectedObjects.map((description, index) => (
                                            <View key={index} style={[styles.itemBox, { backgroundColor: '#3D3D3D' }]}>
                                                <Text style={styles.itemText}>{description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <Text>No Objects Detected</Text>
                            )}
                        </View>

                        {showAnalysis && analysisResult ? (
                            <View>
                                {analysisResult.map((result, index) => (
                                    <View key={index} style={styles.progressBarContainer}>
                                        <Text style={styles.skillLabel}>{result.label}</Text>
                                        <View style={styles.progressBar}>
                                            <View style={[styles.progressBarFill, { width: `${result.score * 100}%` }]}>
                                                <Text style={styles.progressBarText}>{`${Math.round(result.score * 100)}%`}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text></Text>
                        )}



                        {showObjects && (
                            <>
                                <TouchableOpacity onPress={() => setShowSuggestions(!showSuggestions)}>
                                    <View style={styles.accordion}>
                                        <Text style={styles.accordionTitle}>View Suggestions</Text>
                                        <FontAwesome name={showSuggestions ? "chevron-up" : "chevron-down"} size={24} color="#FFFFFF" />
                                    </View>
                                </TouchableOpacity>
                                {showSuggestions && (
                                    <View style={styles.accordionContent}>
                                        <Text style={styles.contentText}>{getSuggestions()}</Text>
                                        <TouchableOpacity
                                            onPress={() => getNLPSuggestions(detectedObjects.join(', '), setSuggestionsHTML)}
                                            style={[styles.analyzeButton, { backgroundColor: '#149D81', width: 150 }]}
                                        >
                                            <Text style={styles.buttonText}>Suggest</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <TouchableOpacity onPress={() => setShowAnalyze(!showAnalyze)}>
                                    <View style={styles.accordion}>
                                        <Text style={styles.accordionTitle}>Analyze Compost Health</Text>
                                        <FontAwesome name={showAnalyze ? "chevron-up" : "chevron-down"} size={24} color="#FFFFFF" />
                                    </View>
                                </TouchableOpacity>
                                {showAnalyze && (
                                    <View style={styles.accordionContent}>
                                        <Text style={styles.contentText}>{getAnalysis()}</Text>
                                        <TouchableOpacity onPress={() => analyseCompostHealth(capturedImageURI)}>
                                            <View style={[styles.analyzeButton, { backgroundColor: '#149D81', width: 150 }]}>
                                                <Text style={styles.buttonText}>Analyze</Text>
                                            </View>
                                        </TouchableOpacity>

                                    </View>
                                )}
                            </>
                        )}
                    </ScrollView>
                    <TouchableOpacity onPress={retakePicture} style={styles.retakeButton}>
                        <FontAwesome name="camera-retro" size={48} color="#FE4628" />
                        <Text style={styles.retakeButtonText}>Retake Picture</Text>
                    </TouchableOpacity>
                </View>
            )}
            {!pictureTaken && !loading && (
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                    <Text style={styles.captureButtonText}>Take Picture</Text>
                </TouchableOpacity>
            )}
            {/* Modal for displaying suggestions */}
            {/* Modal for displaying suggestions */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Suggestions</Text>
                        <ScrollView contentContainerStyle={styles.suggestionsContainer}>
                            {suggestionsHTML}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={clsmodalVisible}
                onRequestClose={() => {
                    setCLSModalVisible(!clsmodalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Compost Health Analysis</Text>
                        {showAnalysis && analysisResult ? (
                            <View>
                                {analysisResult.map((result, index) => (
                                    <View key={index} style={styles.progressBarContainer}>
                                        <Text style={styles.skillLabel}>{result.label}</Text>
                                        <View style={styles.progressBar}>
                                            <View style={[styles.progressBarFill, { width: `${result.score * 100}%` }]}>
                                                <Text style={styles.progressBarText}>{`${Math.round(result.score * 100)}%`}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text>No analysis results available</Text>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setCLSModalVisible(!clsmodalVisible)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



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
    retakeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    retakeButtonText: {
        marginLeft: 10,
        fontSize: 20,
        color: '#007AFF',
    },
    croppedImage: {
        width: 50,
        height: 50,
        resizeMode: 'cover',
        marginVertical: 10,
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
    accordion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#139D83',
        borderRadius: 5,
        marginVertical: 5,
    },
    accordionTitle: {
        fontSize: 18,
        color: '#FFF',
    },
    accordionContent: {
        padding: 20,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        marginBottom: 10,
    },

    buttonContainer: {
        alignItems: 'center', // Center the button horizontally

    },
    analyzeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center', // Center the text within the button
    },
    suggestionText: {
        fontSize: 16,
        color: '#000',
        marginVertical: 5,
    },
    suggestionsContainer: {
        marginTop: 10,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        height: '60%', // Adjust the height as needed
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    suggestionsContainer: {
        marginTop: 15,
        paddingBottom: 20,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#F47434',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    suggestionText: {
        fontSize: 16,
        color: '#000',
        marginVertical: 5,
    },
    suggestionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    progressBarContainer: {
        marginVertical: 10,
    },
    skillLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    progressBar: {
        width: '100%',
        backgroundColor: '#d3d3d3',
        borderRadius: 20,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 30,
        backgroundColor: '#4caf50',
        justifyContent: 'center',
        borderRadius: 20,
    },
    progressBarText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },

    section: {
        marginBottom: 20,
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        padding: 20,
        width: '100%',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    itemContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemBox: {
        width: '100%',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    modelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    activeModelButton: {
        backgroundColor: '#007AFF',
    },
    inactiveModelButton: {
        backgroundColor: '#CCCCCC',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
});
