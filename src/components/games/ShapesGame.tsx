import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';import { useSafeAreaInsets } from 'react-native-safe-area-context';import { AgeBand } from '../../types';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';
import { VoiceButton } from '../VoiceButton';
import * as Speech from 'expo-speech';

interface ShapesGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

export const ShapesGame: React.FC<ShapesGameProps> = ({
  ageBand,
  difficulty,
  onCorrect,
  onWrong,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Auto-speak question when component mounts or question changes
  React.useEffect(() => {
    const speakQuestion = async () => {
      const q = questions[ageBand][currentQuestion % questions[ageBand].length];
      await Speech.speak(q.text, {
        language: 'en',
        pitch: 1.5, // More playful and fun
        rate: 0.95, // Slightly faster for energy
      });
    };
    setTimeout(speakQuestion, 500); // Small delay for component to settle
  }, [currentQuestion, ageBand]);

  // Stop speech on unmount
  React.useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const questions = {
    '3-4': [
      {
        text: 'Find the CIRCLE',
        target: 'circle',
        options: [
          { id: '1', name: 'circle', shape: 'circle', correct: true },
          { id: '2', name: 'square', shape: 'square', correct: false },
          { id: '3', name: 'triangle', shape: 'triangle', correct: false },
        ],
      },
      {
        text: 'Find the SQUARE',
        target: 'square',
        options: [
          { id: '1', name: 'triangle', shape: 'triangle', correct: false },
          { id: '2', name: 'square', shape: 'square', correct: true },
          { id: '3', name: 'circle', shape: 'circle', correct: false },
        ],
      },
      {
        text: 'Find the TRIANGLE',
        target: 'triangle',
        options: [
          { id: '1', name: 'square', shape: 'square', correct: false },
          { id: '2', name: 'circle', shape: 'circle', correct: false },
          { id: '3', name: 'triangle', shape: 'triangle', correct: true },
        ],
      },
    ],
    '5-6': [
      {
        text: 'How many sides does a TRIANGLE have?',
        target: 'triangle',
        options: [
          { id: '1', name: '2', shape: 'triangle', correct: false },
          { id: '2', name: '3', shape: 'triangle', correct: true },
          { id: '3', name: '4', shape: 'triangle', correct: false },
        ],
      },
      {
        text: 'How many sides does a SQUARE have?',
        target: 'square',
        options: [
          { id: '1', name: '3', shape: 'square', correct: false },
          { id: '2', name: '4', shape: 'square', correct: true },
          { id: '3', name: '5', shape: 'square', correct: false },
        ],
      },
      {
        text: 'Find the CIRCLE',
        target: 'circle',
        options: [
          { id: '1', name: 'circle', shape: 'circle', correct: true },
          { id: '2', name: 'square', shape: 'square', correct: false },
          { id: '3', name: 'triangle', shape: 'triangle', correct: false },
        ],
      },
    ],
    '7-8': [
      {
        text: 'How many sides does a PENTAGON have?',
        target: 'pentagon',
        options: [
          { id: '1', name: '4', shape: 'square', correct: false },
          { id: '2', name: '5', shape: 'triangle', correct: true },
          { id: '3', name: '6', shape: 'triangle', correct: false },
        ],
      },
      {
        text: 'How many sides does a TRIANGLE have?',
        target: 'triangle',
        options: [
          { id: '1', name: '3', shape: 'triangle', correct: true },
          { id: '2', name: '4', shape: 'square', correct: false },
          { id: '3', name: '5', shape: 'circle', correct: false },
        ],
      },
      {
        text: 'Find the HEXAGON',
        target: 'hexagon',
        options: [
          { id: '1', name: 'circle', shape: 'circle', correct: false },
          { id: '2', name: 'square', shape: 'square', correct: false },
          { id: '3', name: 'triangle', shape: 'triangle', correct: false },
        ],
      },
    ],
  };

  const q = questions[ageBand][currentQuestion % questions[ageBand].length];
  const insets = useSafeAreaInsets();

  const handleOptionPress = async (option: (typeof q.options)[0]) => {
    const correct = option.correct;

    if (correct) {
      // Success: Speak the shape name, play success animation
      const celebrationMessages = [
        `${option.name}! Yay!`,
        `${option.name}! Yes!`,
        `${option.name}! Nice!`,
        `${option.name}! Awesome!`,
        `${option.name}! Cool!`,
        `${option.name}! Wow!`,
      ];
      const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
      await Speech.speak(message, {
        language: 'en',
        pitch: 1.65, // Very playful!
        rate: 0.95, // Fun and energetic
      });

      // Success animation - spring up
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        onCorrect();
        setCurrentQuestion((prev) => prev + 1);
      }, 600);
    } else {
      // Wrong answer: Speak the option name, then encourage to try again
      const tryAgainMessages = [
        `That's ${option.name}. Try again!`,
        `Nope! That's ${option.name}. Go!`,
        `That's ${option.name}. You got this!`,
        `Oops! That's ${option.name}. Try once more!`,
        `That one's ${option.name}. Keep going!`,
      ];
      const message = tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)];
      await Speech.speak(message, {
        language: 'en',
        pitch: 1.45, // Happy encouragement
        rate: 0.9, // Upbeat
      });

      // Error animation - shake
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        onWrong();
      }, 400);
    }
  };

  const ShapeComponent = ({ shape }: { shape: string }) => {
    const size = 80;
    switch (shape) {
      case 'circle':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="40" fill="#4D96FF" />
          </Svg>
        );
      case 'square':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect x="20" y="20" width="60" height="60" fill="#FFD93D" />
          </Svg>
        );
      case 'triangle':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Polygon points="50,20 80,80 20,80" fill="#FF6B6B" />
          </Svg>
        );
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF9E6',
      paddingHorizontal: 24,
      paddingTop: insets.top + 16,
      paddingBottom: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 32,
      width: '100%',
      justifyContent: 'center',
    },
    questionText: {
      fontSize: 32,
      fontWeight: '900',
      color: '#1a1a1a',
      flex: 1,
      textAlign: 'center',
    },
    voiceButton: {
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    optionsContainer: {
      width: '100%',
      gap: 16,
    },
    optionButton: {
      paddingVertical: 24,
      paddingHorizontal: 16,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    optionLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1a1a1a',
      marginTop: 12,
      textTransform: 'uppercase',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>{q.text}</Text>
        <VoiceButton text={q.text} style={styles.voiceButton} />
      </View>
      <View style={styles.optionsContainer}>
        {q.options.map((option) => (
          <Animated.View
            key={option.id}
            style={{ transform: [{ scale: scaleAnim }] }}
          >
            <TouchableOpacity
              onPress={() => handleOptionPress(option)}
              style={styles.optionButton}
              activeOpacity={0.7}
            >
              <ShapeComponent shape={option.shape} />
              <Text style={styles.optionLabel}>{option.name}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default ShapesGame;
