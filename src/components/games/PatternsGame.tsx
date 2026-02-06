import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shuffleArray } from '../../lib/gameUtils';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import * as Speech from 'expo-speech';

interface PatternsGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

interface PatternOption {
  id: string;
  pattern: string[];
  label: string;
  correct: boolean;
}

export const PatternsGame: React.FC<PatternsGameProps> = ({
  ageBand,
  difficulty,
  onCorrect,
  onWrong,
}) => {
  const insets = useSafeAreaInsets();
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
        text: 'What comes next? Red Blue Red Blue ?',
        sequence: ['🔴', '🔵', '🔴', '🔵'],
        options: [
          { id: '1', pattern: ['🔴'], label: '🔴', correct: true },
          { id: '2', pattern: ['🔵'], label: '🔵', correct: false },
          { id: '3', pattern: ['🟡'], label: '🟡', correct: false },
        ],
      },
      {
        text: 'What comes next? Star Star Moon ?',
        sequence: ['⭐', '⭐', '🌙'],
        options: [
          { id: '1', pattern: ['⭐'], label: '⭐', correct: true },
          { id: '2', pattern: ['🌙'], label: '🌙', correct: false },
          { id: '3', pattern: ['☀️'], label: '☀️', correct: false },
        ],
      },
      {
        text: 'What comes next? Apple Orange Apple Orange ?',
        sequence: ['🍎', '🍊', '🍎', '🍊'],
        options: [
          { id: '1', pattern: ['🍎'], label: '🍎', correct: true },
          { id: '2', pattern: ['🍊'], label: '🍊', correct: false },
          { id: '3', pattern: ['🍌'], label: '🍌', correct: false },
        ],
      },
    ],
    '5-6': [
      {
        text: 'What comes next? Red Red Blue Red Red Blue ?',
        sequence: ['🔴', '🔴', '🔵', '🔴', '🔴', '🔵'],
        options: [
          { id: '1', pattern: ['🔴'], label: '🔴', correct: true },
          { id: '2', pattern: ['🔵'], label: '🔵', correct: false },
          { id: '3', pattern: ['🟡'], label: '🟡', correct: false },
        ],
      },
      {
        text: 'What comes next? 🔵 🟡 🟡 🔵 🟡 🟡 ?',
        sequence: ['🔵', '🟡', '🟡', '🔵', '🟡', '🟡'],
        options: [
          { id: '1', pattern: ['🔵'], label: '🔵', correct: true },
          { id: '2', pattern: ['🟡'], label: '🟡', correct: false },
          { id: '3', pattern: ['🔴'], label: '🔴', correct: false },
        ],
      },
      {
        text: 'What comes next? 1 1 2 1 1 2 ?',
        sequence: ['1️⃣', '1️⃣', '2️⃣', '1️⃣', '1️⃣', '2️⃣'],
        options: [
          { id: '1', pattern: ['1'], label: '1️⃣', correct: true },
          { id: '2', pattern: ['2'], label: '2️⃣', correct: false },
          { id: '3', pattern: ['3'], label: '3️⃣', correct: false },
        ],
      },
    ],
    '7-8': [
      {
        text: 'What comes next? 🔴 🟡 🟢 🔴 🟡 🟢 ?',
        sequence: ['🔴', '🟡', '🟢', '🔴', '🟡', '🟢'],
        options: [
          { id: '1', pattern: ['🔴'], label: '🔴', correct: true },
          { id: '2', pattern: ['🟡'], label: '🟡', correct: false },
          { id: '3', pattern: ['🟢'], label: '🟢', correct: false },
        ],
      },
      {
        text: 'What comes next? 2 3 2 3 2 3 ?',
        sequence: ['2️⃣', '3️⃣', '2️⃣', '3️⃣', '2️⃣', '3️⃣'],
        options: [
          { id: '1', pattern: ['2'], label: '2️⃣', correct: true },
          { id: '2', pattern: ['3'], label: '3️⃣', correct: false },
          { id: '3', pattern: ['4'], label: '4️⃣', correct: false },
        ],
      },
      {
        text: 'What comes next? ⭐ 🌙 ⭐ ⭐ 🌙 ⭐ ?',
        sequence: ['⭐', '🌙', '⭐', '⭐', '🌙', '⭐'],
        options: [
          { id: '1', pattern: ['⭐'], label: '⭐', correct: true },
          { id: '2', pattern: ['🌙'], label: '🌙', correct: false },
          { id: '3', pattern: ['☀️'], label: '☀️', correct: false },
        ],
      },
    ],
  };

  const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];

  const handleOptionPress = async (option: PatternOption) => {
    const correct = option.correct;

    if (correct) {
      // Success: Speak encouragement
      const celebrationMessages = [
        `Yes! Correct!`,
        `Nice! You got it!`,
        `Yay! Perfect!`,
        `Awesome pattern!`,
        `Cool! You did it!`,
        `Wow! Great job!`,
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
      // Wrong answer: Encourage to try again
      const tryAgainMessages = [
        `Try again!`,
        `Nope! Look closer!`,
        `Not that one!`,
        `Almost! Try once more!`,
        `Oops! Keep going!`,
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
      fontSize: 28,
      fontWeight: '900',
      color: '#1a1a1a',
      flex: 1,
      textAlign: 'center',
    },
    voiceButton: {
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    sequenceContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 48,
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    sequenceItem: {
      fontSize: 56,
    },
    questionMark: {
      fontSize: 56,
      color: '#FF6B6B',
      fontWeight: '900',
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
    optionEmoji: {
      fontSize: 56,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>{q.text}</Text>
        <VoiceButton text={q.text} style={styles.voiceButton} />
      </View>

      <View style={styles.sequenceContainer}>
        {q.sequence.map((item, index) => (
          <Text key={index} style={styles.sequenceItem}>
            {item}
          </Text>
        ))}
        <Text style={styles.questionMark}>?</Text>
      </View>

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
              <Text style={styles.optionEmoji}>{option.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default PatternsGame;
