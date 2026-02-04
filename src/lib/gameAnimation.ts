import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Animation timing constants
 */
export const ANIMATION_TIMINGS = {
  successDuration: 600,
  errorDuration: 400,
  springFriction: 4,
  springTension: 40,
} as const;

/**
 * Custom hook for game animations
 */
export function useGameAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /**
   * Play success animation (spring bounce)
   */
  const playSuccessAnimation = (): Promise<void> => {
    return new Promise((resolve) => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          friction: ANIMATION_TIMINGS.springFriction,
          tension: ANIMATION_TIMINGS.springTension,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        resolve();
      });
    });
  };

  /**
   * Play error animation (shake)
   */
  const playErrorAnimation = (): Promise<void> => {
    return new Promise((resolve) => {
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
      ]).start(() => {
        resolve();
      });
    });
  };

  return {
    scaleAnim,
    playSuccessAnimation,
    playErrorAnimation,
  };
}
