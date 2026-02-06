import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { VoiceButton } from '../VoiceButton';
import { shuffleArray } from '../../lib/gameUtils';
import * as Speech from 'expo-speech';
import { Animated } from 'react-native';

interface NumbersGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

export const NumbersGame: React.FC<NumbersGameProps> = ({
  ageBand,
  difficulty,
  onCorrect,
  onWrong,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionOrder] = useState(() => shuffleArray([0, 1, 2]));
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Auto-speak question when component mounts or question changes
  React.useEffect(() => {
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

  const questions = {
    '3-4': [
      {
        text: 'Count the dots',
        count: 1,
        visual: [1],
        options: [
          { id: '1', number: 1, correct: true },
          { id: '2', number: 2, correct: false },
          { id: '3', number: 3, correct: false },
        ],
      },
      {
        text: 'Count the dots',
        count: 2,
        visual: [1, 2],
        options: [
          { id: '1', number: 1, correct: false },
          { id: '2', number: 2, correct: true },
          { id: '3', number: 3, correct: false },
        ],
      },
      {
        text: 'Count the dots',
        count: 3,
        visual: [1, 2, 3],
        options: [
          { id: '1', number: 2, correct: false },
          { id: '2', number: 3, correct: true },
          { id: '3', number: 4, correct: false },
        ],
      },
    ],
    '5-6': [
      {
        text: 'What is 2 + 1?',
        count: 3,
        visual: [1, 2, 3],
        options: [
          { id: '1', number: 2, correct: false },
          { id: '2', number: 3, correct: true },
          { id: '3', number: 4, correct: false },
        ],
      },
      {
        text: 'Count the dots',
        count: 5,
        visual: [1, 2, 3, 4, 5],
        options: [
          { id: '1', number: 4, correct: false },
          { id: '2', number: 5, correct: true },
          { id: '3', number: 6, correct: false },
        ],
      },
    ],
    '7-8': [
      {
        text: 'What is 5 + 3?',
        count: 8,
        visual: [1, 2, 3, 4, 5, 6, 7, 8],
        options: [
          { id: '1', number: 7, correct: false },
          { id: '2', number: 8, correct: true },
          { id: '3', number: 9, correct: false },
        ],
      },
    ],
  };

  const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];
  const insets = useSafeAreaInsets();

  const handleOptionPress = async (option: (typeof q.options)[0]) => {
    const correct = option.correct;

    if (correct) {
      // Success: Speak the number, play success animation
      const celebrationMessages = [
        `${option.number}! Yay!`,
        `${option.number}! Yes!`,
        `${option.number}! Nice!`,
        `${option.number}! Awesome!`,
        `${option.number}! Cool!`,
        `${option.number}! Wow!`,
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
      // Wrong answer: Speak the number, encourage to try again
      const tryAgainMessages = [
        `That's ${option.number}. Try again!`,
        `Nope! That's ${option.number}. Go!`,
        `That's ${option.number}. Keep trying!`,
        `Oops! That's ${option.number}. Once more!`,
        `That one's ${option.number}. You can do it!`,
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

  const DotVisualizer = ({ count }: { count: number }) => {
    const dots = Array.from({ length: count }, (_, i) => i);
    const cols = count <= 5 ? count : 5;
    const size = Math.min(60 / (cols + 1), 15);

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
        {dots.map((i) => (
          <Svg key={i} width={size * 3} height={size * 3} viewBox="0 0 30 30">
            <SvgCircle cx="15" cy="15" r="12" fill="#FFD93D" />
          </Svg>
        ))}
      </View>
    );
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
      fontSize: 36,
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
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: 12,
      marginTop: 32,
    },
    optionButton: {
      flex: 1,
      paddingVertical: 28,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4D96FF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 8,
      minHeight: 100,
    },
    optionNumber: {
      fontSize: 48,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>{q.text}</Text>
        <VoiceButton text={q.text} style={styles.voiceButton} />
      </View>
      <DotVisualizer count={q.count} />
      <View style={styles.optionsContainer}>
        {q.options.map((option) => (
          <Animated.View
            key={option.id}
            style={{ transform: [{ scale: scaleAnim }], flex: 1 }}
          >
            <TouchableOpacity
              onPress={() => handleOptionPress(option)}
              style={styles.optionButton}
              activeOpacity={0.7}
            >
              <Text style={styles.optionNumber}>{option.number}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default NumbersGame;
