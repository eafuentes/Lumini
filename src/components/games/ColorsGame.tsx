import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { shuffleArray } from '../../lib/gameUtils';
import * as Speech from 'expo-speech';

interface ColorOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
  correct: boolean;
}

interface ColorsGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

export const ColorsGame: React.FC<ColorsGameProps> = ({
  ageBand,
  difficulty,
  onCorrect,
  onWrong,
}) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const [questionOrder] = useState(() => shuffleArray([0, 1, 2]));

  // Auto-speak question when component mounts or question changes
  useEffect(() => {
    const speakQuestion = async () => {
      const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];
      await Speech.speak(q.text, {
        language: 'en',
        pitch: 1.5, // More playful and fun
        rate: 0.95, // Slightly faster for energy
      });
    };
    setTimeout(speakQuestion, 500); // Small delay for component to settle
  }, [currentQuestion, ageBand, questionOrder]);
  // Stop speech on unmount
  React.useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);
  // Questions by age band
  const questions = {
    '3-4': [
      {
        text: 'Find the RED color',
        target: 'red',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: true },
          { id: '2', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
        ] as ColorOption[],
      },
      {
        text: 'Find the BLUE color',
        target: 'blue',
        options: [
          { id: '1', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
          { id: '2', name: 'blue', emoji: '🔵', color: '#0000FF', correct: true },
          { id: '3', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
        ] as ColorOption[],
      },
      {
        text: 'Find the YELLOW color',
        target: 'yellow',
        options: [
          { id: '1', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: true },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
        ] as ColorOption[],
      },
    ],
    '5-6': [
      {
        text: 'Find the GREEN color',
        target: 'green',
        options: [
          { id: '1', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: true },
          { id: '3', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
        ] as ColorOption[],
      },
      {
        text: 'Find the PURPLE color',
        target: 'purple',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: true },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ] as ColorOption[],
      },
    ],
    '7-8': [
      {
        text: 'Mix RED + BLUE = ?',
        target: 'purple',
        options: [
          { id: '1', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: true },
          { id: '3', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
        ] as ColorOption[],
      },
    ],
  };

  const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];
  const selectedOption = q.options.find((opt) => opt.correct);

  const handleOptionPress = async (option: ColorOption) => {
    const correct = option.correct;

    if (correct) {
      // Success: Speak the color name, play success animation
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
      textAlign: 'center',
      flex: 1,
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
      paddingVertical: 28,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    optionEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
    optionLabel: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      letterSpacing: 1,
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
              style={[
                styles.optionButton,
                { backgroundColor: option.color },
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionLabel}>{option.name}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default ColorsGame;
