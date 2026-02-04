import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import * as Speech from 'expo-speech';

interface SortingGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

interface SortingOption {
  id: string;
  label: string;
  emoji: string;
  correct: boolean;
}

export const SortingGame: React.FC<SortingGameProps> = ({
  ageBand,
  difficulty,
  onCorrect,
  onWrong,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  // Auto-speak question when component mounts or question changes
  React.useEffect(() => {
    const speakQuestion = async () => {
      const q = questions[ageBand][currentQuestion % questions[ageBand].length];
      await Speech.speak(q.text, {
        language: 'en',
        pitch: 1.5,
        rate: 0.95,
      });
    };
    setTimeout(speakQuestion, 500);
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
        text: 'Where does the apple go?',
        item: '🍎',
        options: [
          { id: '1', label: 'Fruits', emoji: '🍎', correct: true },
          { id: '2', label: 'Animals', emoji: '🐶', correct: false },
          { id: '3', label: 'Shapes', emoji: '⭐', correct: false },
        ],
      },
      {
        text: 'Where does the dog go?',
        item: '🐶',
        options: [
          { id: '1', label: 'Animals', emoji: '🐶', correct: true },
          { id: '2', label: 'Fruits', emoji: '🍎', correct: false },
          { id: '3', label: 'Toys', emoji: '🧸', correct: false },
        ],
      },
      {
        text: 'Where does the star go?',
        item: '⭐',
        options: [
          { id: '1', label: 'Shapes', emoji: '⭐', correct: true },
          { id: '2', label: 'Animals', emoji: '🐱', correct: false },
          { id: '3', label: 'Fruits', emoji: '🍌', correct: false },
        ],
      },
    ],
    '5-6': [
      {
        text: 'Where does the car go?',
        item: '🚗',
        options: [
          { id: '1', label: 'Vehicles', emoji: '🚗', correct: true },
          { id: '2', label: 'Foods', emoji: '🍕', correct: false },
          { id: '3', label: 'Clothes', emoji: '👕', correct: false },
        ],
      },
      {
        text: 'Where does the pizza go?',
        item: '🍕',
        options: [
          { id: '1', label: 'Foods', emoji: '🍕', correct: true },
          { id: '2', label: 'Vehicles', emoji: '🚌', correct: false },
          { id: '3', label: 'Clothes', emoji: '👗', correct: false },
        ],
      },
      {
        text: 'Where does the shirt go?',
        item: '👕',
        options: [
          { id: '1', label: 'Clothes', emoji: '👕', correct: true },
          { id: '2', label: 'Foods', emoji: '🍇', correct: false },
          { id: '3', label: 'Vehicles', emoji: '🚲', correct: false },
        ],
      },
    ],
    '7-8': [
      {
        text: 'Is this living or not?',
        item: '🌳',
        options: [
          { id: '1', label: 'Living', emoji: '🌱', correct: true },
          { id: '2', label: 'Non-living', emoji: '🏀', correct: false },
          { id: '3', label: 'Weather', emoji: '☁️', correct: false },
        ],
      },
      {
        text: 'Is this living or not?',
        item: '⚽',
        options: [
          { id: '1', label: 'Non-living', emoji: '⚽', correct: true },
          { id: '2', label: 'Living', emoji: '🐟', correct: false },
          { id: '3', label: 'Weather', emoji: '🌧️', correct: false },
        ],
      },
      {
        text: 'Where does the cloud go?',
        item: '☁️',
        options: [
          { id: '1', label: 'Weather', emoji: '☁️', correct: true },
          { id: '2', label: 'Living', emoji: '🦋', correct: false },
          { id: '3', label: 'Non-living', emoji: '🧱', correct: false },
        ],
      },
    ],
  };

  const q = questions[ageBand][currentQuestion % questions[ageBand].length];

  const handleOptionPress = async (option: (typeof q.options)[0]) => {
    const correct = option.correct;

    if (correct) {
      const celebrationMessages = [
        `${option.label}! Yay!`,
        `${option.label}! Yes!`,
        `${option.label}! Nice!`,
        `${option.label}! Awesome!`,
        `${option.label}! Cool!`,
        `${option.label}! Wow!`,
      ];
      const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
      await Speech.speak(message, {
        language: 'en',
        pitch: 1.65,
        rate: 0.95,
      });

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
      const tryAgainMessages = [
        `That's ${option.label}. Try again!`,
        `Nope! That's ${option.label}. Go!`,
        `That's ${option.label}. Keep trying!`,
        `Oops! That's ${option.label}. Once more!`,
        `That is ${option.label}. You can do it!`,
      ];
      const message = tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)];
      await Speech.speak(message, {
        language: 'en',
        pitch: 1.45,
        rate: 0.9,
      });

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
      marginBottom: 24,
      width: '100%',
      justifyContent: 'center',
    },
    questionText: {
      fontSize: 30,
      fontWeight: '900',
      color: '#1a1a1a',
      textAlign: 'center',
      flex: 1,
    },
    voiceButton: {
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    itemCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 28,
      paddingVertical: 24,
      paddingHorizontal: 32,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 10,
      marginBottom: 24,
    },
    itemEmoji: {
      fontSize: 64,
    },
    optionsContainer: {
      width: '100%',
      gap: 14,
    },
    optionButton: {
      paddingVertical: 18,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4D96FF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 8,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    optionEmoji: {
      fontSize: 24,
    },
    optionLabel: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>{q.text}</Text>
        <VoiceButton text={q.text} style={styles.voiceButton} />
      </View>

      <View style={styles.itemCard}>
        <Text style={styles.itemEmoji}>{q.item}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {q.options.map((option) => (
          <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={() => handleOptionPress(option)}
              style={styles.optionButton}
              activeOpacity={0.7}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default SortingGame;