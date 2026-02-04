import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityId, AgeBand } from '../src/types';
import { getAgeBand, getDifficultyLevel, markCompletedToday } from '../src/lib/storage';
import { DifficultyManager } from '../src/lib/difficulty';
import { PrimaryButton } from '../src/components/PrimaryButton';
import * as Speech from 'expo-speech';
import { ColorsGame } from '../src/components/games/ColorsGame';
import { ShapesGame } from '../src/components/games/ShapesGame';
import { NumbersGame } from '../src/components/games/NumbersGame';
import { PatternsGame } from '../src/components/games/PatternsGame';
import { MemoryGame } from '../src/components/games/MemoryGame';
import { SortingGame } from '../src/components/games/SortingGame';
import { LogicGame } from '../src/components/games/LogicGame';

/**
 * Activity screen - displays interactive games
 * Auto-advance on correct, provides feedback
 */
export default function ActivityScreen() {
  const router = useRouter();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const { width } = useWindowDimensions();
  const [ageBand, setAgeBand] = useState<AgeBand>('3-4');
  const [difficulty, setDifficulty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [difficultyManager, setDifficultyManager] = useState<DifficultyManager | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      if (!activityId) return;

      const userAgeBand = await getAgeBand();
      setAgeBand(userAgeBand);

      const userDifficulty = await getDifficultyLevel(activityId);
      setDifficulty(userDifficulty);

      setDifficultyManager(new DifficultyManager(userDifficulty));
      setIsLoading(false);
    }
    load();
  }, [activityId]);

  const handleCorrect = async () => {
    const newCount = correctCount + 1;
    setCorrectCount(newCount);
    setTotalAttempts((prev) => prev + 1);

    if (!difficultyManager) return;
    difficultyManager.recordCorrect();
    const newLevel = difficultyManager.getDifficultyAdjustment();
    if (newLevel) {
      setDifficulty(newLevel);
    }

    // Complete after 5 correct answers
    if (newCount >= 5) {
      Speech.stop(); // Stop any ongoing speech before completion
      await markCompletedToday();
      setSessionComplete(true);
    }
  };

  const handleWrong = () => {
    setTotalAttempts((prev) => prev + 1);

    if (!difficultyManager) return;
    difficultyManager.recordWrong();
    const newLevel = difficultyManager.getDifficultyAdjustment();
    if (newLevel) {
      setDifficulty(newLevel);
    }
  };

  const handleFinish = () => {
    router.back();
  };

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading]);

  // Stop speech when navigating away
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Speak completion message
  useEffect(() => {
    if (sessionComplete) {
      setTimeout(() => {
        Speech.speak('Wonderful! Great job! See you tomorrow!', {
          language: 'en',
          pitch: 1.65,
          rate: 0.95,
        });
      }, 500);
    }
  }, [sessionComplete]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF9E6',
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: '#FFF9E6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      color: '#888',
    },
    completionContainer: {
      flex: 1,
      backgroundColor: '#F0FDF4',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    completionEmoji: {
      fontSize: 80,
      marginBottom: 24,
    },
    completionTitle: {
      fontSize: 48,
      fontWeight: '900',
      color: '#1a1a1a',
      marginBottom: 16,
    },
    completionText: {
      fontSize: 18,
      color: '#666',
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 28,
    },
    activityContainer: {
      flex: 1,
    },
    contentSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    activityText: {
      fontSize: 18,
      color: '#888',
    },
    buttonSection: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    buttonContainer: {
      flex: 1,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  if (sessionComplete) {
    return (
      <Animated.View
        style={[
          styles.completionContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.completionEmoji}>✨</Text>
        <Text style={styles.completionTitle}>Wonderful!</Text>
        <Text style={styles.completionText}>
          You got {correctCount} out of {totalAttempts} correct!{`\n`}Great job! See you tomorrow!
        </Text>
        <PrimaryButton label="Back to Home" onPress={handleFinish} />
      </Animated.View>
    );
  }

  // Render appropriate game based on activityId
  if (!isLoading && activityId) {
    const gameProps = {
      ageBand,
      difficulty: difficulty as 1 | 2 | 3,
      onCorrect: handleCorrect,
      onWrong: handleWrong,
    };

    switch (activityId) {
      case 'colors':
        return <ColorsGame {...gameProps} />;
      case 'shapes':
        return <ShapesGame {...gameProps} />;
      case 'numbers':
        return <NumbersGame {...gameProps} />;
      case 'patterns':
        return <PatternsGame {...gameProps} />;
      case 'memory':
        return <MemoryGame {...gameProps} />;
      case 'sorting':
        return <SortingGame {...gameProps} />;
      case 'logic':
        return <LogicGame {...gameProps} />;
      default:
        return (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Game coming soon!</Text>
          </View>
        );
    }
  }

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};
