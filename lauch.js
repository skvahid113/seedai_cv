import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Launch() {
    const navigation = useNavigation();
    const [showCursorSubtitle, setShowCursorSubtitle] = useState(true);
    const [subtitleText, setSubtitleText] = useState('');
    const [seedAIEnabled, setSeedAIEnabled] = useState(false); // State variable to control SeedAI visibility

    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursorSubtitle((prevShowCursor) => !prevShowCursor);
        }, 500); // Adjust blinking speed here

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const typeText = async () => {
            const subtitle = 'Monitor and manage compost health with';
            while (true) {
                for (let i = 0; i <= subtitle.length; i++) {
                    setSubtitleText(subtitle.substring(0, i));
                    await new Promise((resolve) => setTimeout(resolve, 50)); // Adjust typing speed here
                }
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Pause before restarting
                setSubtitleText('');
                setSeedAIEnabled(true); // Enable SeedAI text after typing animation is completed
                await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for a while before disabling SeedAI text
                setSeedAIEnabled(false); // Disable SeedAI text for the next typing animation
            }
        };
        typeText();
    }, []);

    const handleGetStarted = () => {
        navigation.navigate('Home');
    };

    return (
        <ImageBackground source={require('./assets/gif.gif')} style={styles.background}>
            <View style={styles.overlay}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Wormhealth</Text>
                    <Text style={styles.titleai}>
                        <Text style={styles.part1}>A</Text>
                        <Text style={styles.part2}>I</Text>
                    </Text>
                    <Text style={styles.subtitle}>{subtitleText}{showCursorSubtitle ? '|' : ''}</Text>
                    {seedAIEnabled && ( // Render SeedAI text only if it's enabled
                        <Text style={styles.seedaiText}>SeedAI</Text>
                    )}
                </View>
                <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                    <LinearGradient
                        colors={['#40B64F', '#40B64F', '#FDE500']}
                        style={styles.gradientButton}
                        start={[0, 0.5]}
                        end={[1, 0.5]}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.9, // Adjust the opacity value here
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 20,
        paddingBottom: 40, // Add padding to the bottom
        width: '100%',
    },
    textContainer: {
        alignItems: 'center',
        marginTop: '20%', // Align text slightly higher
    },
    title: {
        fontSize: 58,
        color: '#00E676',
        marginBottom: 10,
        textAlign: 'center',
        fontStyle: 'agrandir',
        fontStyle: 'italic'
    },
    titleai: {
        fontSize: 80,
        color: '#80267D',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 30,
        color: '#FFFFFF',
        marginBottom: 5,
        textAlign: 'center',
    },
    seedaiText: {
        fontSize: 62,
        color: '#06BCCD',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    button: {
        // marginTop: 20,
        borderRadius: 8,
        overflow: 'hidden', // Ensure gradient button doesn't overflow its border-radius
    },
    gradientButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
    },

    part1: {
        color: '#F4D03F',  // Color for the first part (A)
    },
    part2: {
        color: '#C65042',  // Color for the second part (I)
    },
});
