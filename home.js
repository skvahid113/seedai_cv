import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home({ navigation }) { // Ensure you receive 'navigation' as a prop
  const [showCursor, setShowCursor] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const interval = setInterval(() => {
        setShowCursor((prevShowCursor) => !prevShowCursor);
      }, 2000); // Adjust blinking speed here

      const typeText = async () => {
        const fullText = `
                    What Can You Do?
                    
                    1. Scan Compost - Take a photo of your compost pile and let our AI-powered computer vision model analyze it.
                    
                    2. Get Instant Feedback - Receive immediate results on what objects are detected in the compost.
                    
                    3. Compost Health Classification - Understand whether your compost is healthy or unhealthy, and get tips on how to improve it.
                `;
        setTypedText('');
        setTypingComplete(false);
        for (let i = 0; i <= fullText.length; i++) {
          setTypedText(fullText.substring(0, i));
          await new Promise((resolve) => setTimeout(resolve, 10)); // Adjust typing speed here
        }
        setTypingComplete(true);
      };

      typeText();

      return () => {
        clearInterval(interval);
      };
    }, [])
  );

  const handleScanCompost = () => {
    // Navigate to DiagnoseScreen
    navigation.navigate('Diagnose'); // Replace 'DiagnoseScreen' with the actual name of your screen
  };

  return (
    <ImageBackground source={require('./assets/logo.png')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome to SEEDAI</Text>
        <Text style={styles.subtitle}>Transforming Waste into Gold with AI</Text>
        <Text style={styles.typingText}>
          {typedText}
          {showCursor && !typingComplete ? '|' : ''}
        </Text>
        {typingComplete && (
          <TouchableOpacity style={styles.button} onPress={handleScanCompost}>
            <LinearGradient
              colors={['#F4C624', '#566B12', '#D1AC65']}
              style={styles.gradientButton}
              start={[0, 0.5]}
              end={[1, 0.5]}
            >
              <Text style={styles.buttonText}>Start Scanning Today!</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00E676',
    marginVertical: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#A7E51A',
    marginVertical: 10,
    textAlign: 'center',
  },
  typingText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 20,
  },
  gradientButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
});
