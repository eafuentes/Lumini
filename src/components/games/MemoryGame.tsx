import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import * as Speech from 'expo-speech';

interface MemoryGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

interface Card {
  id: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  ageBand,
  difficulty,
  onCorrect,
  onWrong,
}) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const emojis = ['🍎', '🍌', '🍊', '🍇', '🍓', '🍑', '🥝', '🍒'];

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [ageBand]);

  // Auto-speak instruction
  useEffect(() => {
    const message = 'Match the pairs! Tap two cards to find matching pairs.';
    Speech.speak(message, {
      language: 'en',
      pitch: 1.5,
      rate: 0.95,
    });
  }, []);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const initializeGame = () => {
    let numPairs = 0;
    if (ageBand === '3-4') numPairs = 3;
    else if (ageBand === '5-6') numPairs = 4;
    else numPairs = 6;

    setTotalPairs(numPairs);
    setMatchedPairs(0);
    setSelectedCards([]);

    // Create pairs
    const selectedEmojis = emojis.slice(0, numPairs);
    const cardPairs = [...selectedEmojis, ...selectedEmojis];

    // Shuffle
    const shuffled = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({
        id: idx.toString(),
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
  };

  const handleCardPress = async (cardId: string) => {
    if (isProcessing || selectedCards.length >= 2) return;
    if (selectedCards.includes(cardId)) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) return;

    const newSelectedCards = [...selectedCards, cardId];
    setSelectedCards(newSelectedCards);

    // Flip card
    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    // Check for match when 2 cards selected
    if (newSelectedCards.length === 2) {
      setIsProcessing(true);

      setTimeout(async () => {
        const card1 = newCards.find((c) => c.id === newSelectedCards[0]);
        const card2 = newCards.find((c) => c.id === newSelectedCards[1]);

        if (card1 && card2) {
          if (card1.emoji === card2.emoji) {
            // Match!
            const matched = newCards.map((c) =>
              c.id === card1.id || c.id === card2.id
                ? { ...c, isMatched: true }
                : c
            );
            setCards(matched);
            setMatchedPairs((prev) => prev + 1);

            await Speech.speak(`Match! You found ${card1.emoji}!`, {
              language: 'en',
              pitch: 1.65,
              rate: 0.95,
            });

            // Success animation
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

            if (matchedPairs + 1 === totalPairs) {
              setTimeout(() => {
                Speech.speak('Awesome! You won! All pairs matched!', {
                  language: 'en',
                  pitch: 1.65,
                  rate: 0.95,
                });
                onCorrect();
              }, 600);
            }
          } else {
            // No match
            await Speech.speak('Try again!', {
              language: 'en',
              pitch: 1.45,
              rate: 0.9,
            });

            // Shake animation
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

            // Flip back
            const flipped = newCards.map((c: Card) =>
              c.id === card1.id || c.id === card2.id
                ? { ...c, isFlipped: false }
                : c
            );
            setCards(flipped);
            onWrong();
          }
        }

        setSelectedCards([]);
        setIsProcessing(false);
      }, 600);
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
    },
    headerSection: {
      marginBottom: 24,
      alignItems: 'center',
    },
    questionText: {
      fontSize: 28,
      fontWeight: '900',
      color: '#1a1a1a',
      textAlign: 'center',
      marginBottom: 8,
    },
    voiceButton: {
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
    scoreText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#666',
      textAlign: 'center',
      marginTop: 8,
    },
    gridContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    cardWrapper: {
      width: '23%',
      aspectRatio: 1,
    },
    cardWrapperLarge: {
      width: '31%',
      aspectRatio: 1,
    },
    card: {
      flex: 1,
      backgroundColor: '#4D96FF',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    cardMatched: {
      backgroundColor: '#A8E6CF',
    },
    cardEmoji: {
      fontSize: 48,
    },
    cardBack: {
      fontSize: 32,
    },
  });

  const gridWidth = ageBand === '3-4' ? 3 : ageBand === '5-6' ? 4 : 6;
  const cardWidthClass =
    gridWidth === 3 ? styles.cardWrapperLarge : styles.cardWrapper;

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>🎮 Memory Match</Text>
        <Text style={styles.scoreText}>
          Pairs: {matchedPairs} / {totalPairs}
        </Text>
        <VoiceButton
          text={`Match the pairs! Progress: ${matchedPairs} of ${totalPairs} pairs matched.`}
          style={styles.voiceButton}
        />
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {cards.map((card) => (
            <View key={card.id} style={cardWidthClass}>
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnim }],
                  flex: 1,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleCardPress(card.id)}
                  style={[
                    styles.card,
                    card.isMatched && styles.cardMatched,
                  ]}
                  activeOpacity={0.7}
                  disabled={card.isMatched || card.isFlipped}
                >
                  {card.isFlipped || card.isMatched ? (
                    <Text style={styles.cardEmoji}>{card.emoji}</Text>
                  ) : (
                    <Text style={styles.cardBack}>?</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MemoryGame;
