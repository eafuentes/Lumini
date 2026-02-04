import * as Speech from 'expo-speech';

/**
 * Shared voice settings for consistent audio across all games
 */
export const VOICE_SETTINGS = {
  question: {
    pitch: 1.5,
    rate: 0.95,
  },
  success: {
    pitch: 1.65,
    rate: 0.95,
  },
  error: {
    pitch: 1.45,
    rate: 0.9,
  },
} as const;

/**
 * Reusable success message templates
 */
export const SUCCESS_MESSAGES = [
  (label: string) => `${label}! Yay!`,
  (label: string) => `${label}! Yes!`,
  (label: string) => `${label}! Nice!`,
  (label: string) => `${label}! Awesome!`,
  (label: string) => `${label}! Cool!`,
  (label: string) => `${label}! Wow!`,
];

/**
 * Reusable error message templates
 */
export const ERROR_MESSAGES = [
  (label: string) => `That's ${label}. Try again!`,
  (label: string) => `Nope! That's ${label}. Go!`,
  (label: string) => `That's ${label}. Keep trying!`,
  (label: string) => `Oops! That's ${label}. Once more!`,
  (label: string) => `That is ${label}. You can do it!`,
];

/**
 * Get random message from array
 */
export function getRandomMessage(messages: Array<(label: string) => string>, label: string): string {
  const messageTemplate = messages[Math.floor(Math.random() * messages.length)];
  return messageTemplate(label);
}

/**
 * Speak a message with given voice settings
 */
export async function speakMessage(
  text: string,
  settings: typeof VOICE_SETTINGS.question | typeof VOICE_SETTINGS.success | typeof VOICE_SETTINGS.error
): Promise<void> {
  try {
    await Speech.speak(text, {
      language: 'en',
      pitch: settings.pitch,
      rate: settings.rate,
    });
  } catch (error) {
    console.warn('Speech error:', error);
  }
}

/**
 * Stop all speech
 */
export function stopSpeech(): void {
  try {
    Speech.stop();
  } catch (error) {
    console.warn('Stop speech error:', error);
  }
}

/**
 * Get difficulty-based count for memory-like games
 */
export function getDifficultyCount(ageBand: string): number {
  switch (ageBand) {
    case '3-4':
      return 3;
    case '5-6':
      return 4;
    case '7-8':
      return 6;
    default:
      return 3;
  }
}
