import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, StyleSheet, AppState, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { isCompletedToday, getAgeBand, setAgeBand, isSoundEnabled, getCompletedDate } from '../src/lib/storage';
import { getTodaysActivityId, getActivityName } from '../src/lib/schedule';
import { ParentCornerModal } from '../src/components/ParentCornerModal';
import { AgeBand } from '../src/types';
import * as Icons from '../src/components/icons';
import { VoiceButton } from '../src/components/VoiceButton';
import * as Speech from 'expo-speech';

/**
 * Home Screen
 * Shows today's activity with completion status
 * Large primary button to start
 * Parent corner access (lock icon + 2 second press)
 */
export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [completed, setCompleted] = useState(false);
  const [activityId, setActivityId] = useState<string>('');
  const [activityName, setActivityName] = useState('');
  const [parentCornerVisible, setParentCornerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lockPressStart, setLockPressStart] = useState<number>(0);
  const [currentAgeBand, setCurrentAgeBand] = useState<AgeBand>('3-4');
  const [showAgeSelector, setShowAgeSelector] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [dailyStreak, setDailyStreak] = useState(0);
  const hasWelcomedRef = useRef(false);

  const calculateStreak = useCallback(async () => {
    const completedDate = await getCompletedDate();
    if (!completedDate) {
      setDailyStreak(0);
      return;
    }

    const today = new Date();
    const completed = new Date(completedDate);

    const daysDiff = Math.floor((today.getTime() - completed.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) {
      setDailyStreak(1);
    } else if (daysDiff === 1) {
      setDailyStreak(1);
    } else {
      setDailyStreak(0);
    }
  }, []);

  const loadHome = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) setIsLoading(true);

      const today = getTodaysActivityId();
      setActivityId(today);
      setActivityName(getActivityName(today));

      const completedToday = await isCompletedToday();
      setCompleted(completedToday);

      const userAgeBand = await getAgeBand();
      setCurrentAgeBand(userAgeBand);

      const sound = await isSoundEnabled();
      setSoundEnabledState(sound);

      await calculateStreak();

      if (showLoading) setIsLoading(false);
    },
    [calculateStreak]
  );

  // Load today's activity and completion status (initial load)
  useEffect(() => {
    loadHome(true);
  }, [loadHome]);

  // Refresh when returning to the home screen
  useFocusEffect(
    useCallback(() => {
      loadHome(false);
    }, [loadHome])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        loadHome(false);
      }
    });

    return () => subscription.remove();
  }, [loadHome]);

  useEffect(() => {
    if (isLoading || !soundEnabled || hasWelcomedRef.current || !activityName) return;
    hasWelcomedRef.current = true;
    const message = `Hi there! Today's adventure is ${activityName}. Ready to play?`;
    Speech.speak(message, {
      language: 'en',
      pitch: 1.4,
      rate: 0.85,
    });
  }, [isLoading, soundEnabled, activityName]);

  // Icon map for activities
  const iconMap: Record<string, React.FC<any>> = {
    colors: Icons.ColorIcon,
    shapes: Icons.ShapeIcon,
    numbers: Icons.NumberIcon,
    patterns: Icons.PatternIcon,
    memory: Icons.MemoryIcon,
    sorting: Icons.SortingIcon,
    logic: Icons.LogicIcon,
  };

  const IconComponent = iconMap[activityId];
  const iconSize = Math.min(width - 64, 200);

  const handleStartPress = () => {
    router.push({
      pathname: '/activity',
      params: { activityId },
    });
  };

  const handlePlaygroundPress = () => {
    router.push('/playground');
  };

  const getEncouragingMessage = () => {
    const messages = [
      "You're doing great! Ready to learn?",
      "Let's have some fun learning today!",
      "One bright activity, plenty of fun!",
      "Ready for an adventure?",
      "Learning is fun with Solimo!",
      "Let's make learning magical!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleAgeBandChange = async (band: AgeBand) => {
    setCurrentAgeBand(band);
    await setAgeBand(band);
    setShowAgeSelector(false);
  };

  const handleLockPressIn = () => {
    setLockPressStart(Date.now());
  };

  const handleLockPressOut = () => {
    const pressDuration = Date.now() - lockPressStart;
    // 2 second press = 2000ms
    if (pressDuration >= 2000) {
      setParentCornerVisible(true);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF9E6',
      paddingTop: insets.top,
    },
    topSection: {
      paddingTop: 8,
      paddingRight: 16,
      paddingBottom: 12,
    },
    lockButton: {
      padding: 12,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    mainContent: {
      flex: 1,
    },
    mainContentScroll: {
      paddingHorizontal: 24,
      paddingVertical: 32,
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: '900',
      color: '#1a1a1a',
      textAlign: 'center',
      marginBottom: 6,
    },
    heroSubtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 24,
    },
    streakBadge: {
      backgroundColor: '#FEF08A',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    streakText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#92400E',
    },
    activityCard: {
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: 28,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 10,
      marginBottom: 24,
    },
    activityBadge: {
      backgroundColor: '#E0F2FE',
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#7DD3FC',
    },
    activityBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#0284C7',
      letterSpacing: 0.4,
    },
    iconContainer: {
      marginBottom: 16,
      padding: 24,
      backgroundColor: '#FFF7D6',
      borderRadius: 28,
    },
    activityName: {
      fontSize: 36,
      fontWeight: '900',
      color: '#1a1a1a',
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    activityHint: {
      fontSize: 14,
      color: '#666',
      marginTop: 6,
      textAlign: 'center',
    },
    voiceRow: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    voiceRowText: {
      fontSize: 12,
      color: '#666',
      fontWeight: '600',
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 32,
      marginTop: 8,
    },
    startButton: {
      backgroundColor: '#FFD93D',
      paddingHorizontal: 48,
      paddingVertical: 24,
      borderRadius: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 16,
      minWidth: Math.min(width - 48, 300),
    },
    startButtonText: {
      fontSize: 32,
      fontWeight: '900',
      color: '#1a1a1a',
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    completedContainer: {
      backgroundColor: '#A8E6CF',
      paddingHorizontal: 48,
      paddingVertical: 24,
      borderRadius: 40,
      borderWidth: 4,
      borderColor: '#5FD3B0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 12,
      marginBottom: 24,
    },
    completedText: {
      fontSize: 28,
      fontWeight: '800',
      color: '#2d6a4f',
      textAlign: 'center',
    },
    completedButtonsContainer: {
      gap: 12,
    },
    playgroundButton: {
      backgroundColor: '#3B82F6',
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 30,
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    playgroundButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: 'white',
      textAlign: 'center',
    },
    descriptionText: {
      fontSize: 14,
      color: '#888',
      textAlign: 'center',
      marginTop: 24,
    },
    ageSelectorButton: {
      marginTop: 32,
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: '#E0F2FE',
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#0284C7',
    },
    ageSelectorButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#0284C7',
      textAlign: 'center',
    },
    ageModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    ageModalContent: {
      backgroundColor: 'white',
      borderRadius: 32,
      padding: 32,
      width: '100%',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 20,
    },
    ageModalTitle: {
      fontSize: 36,
      fontWeight: '900',
      color: '#1a1a1a',
      marginBottom: 24,
      textAlign: 'center',
    },
    ageOptionsScroll: {
      width: '100%',
    },
    ageOptionsContainer: {
      gap: 14,
      paddingBottom: 8,
    },
    ageOption: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderRadius: 20,
      borderWidth: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ageOptionActive: {
      backgroundColor: '#FFD93D',
      borderColor: '#F59E0B',
    },
    ageOptionInactive: {
      backgroundColor: '#F3F4F6',
      borderColor: '#D1D5DB',
    },
    ageOptionText: {
      fontSize: 24,
      fontWeight: '800',
      color: '#1a1a1a',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <Text style={{ fontSize: 20, color: '#666' }}>Loading Solimo...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top section with lock icon */}
      <View style={styles.topSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchableOpacity
            onPressIn={handleLockPressIn}
            onPressOut={handleLockPressOut}
            style={styles.lockButton}
            activeOpacity={0.6}
          >
            <Text style={{ fontSize: 32 }}>🔒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitle}>Good day!</Text>
        <Text style={styles.heroSubtitle}>{getEncouragingMessage()}</Text>

        {/* Daily Streak Badge */}
        {dailyStreak > 0 && (
          <View style={styles.streakBadge}>
            <Text>🔥</Text>
            <Text style={styles.streakText}>Streak: {dailyStreak} day</Text>
          </View>
        )}

        {/* Activity icon */}
        <View style={styles.activityCard}>
          <View style={styles.activityBadge}>
            <Text style={styles.activityBadgeText}>TODAY’S ADVENTURE</Text>
          </View>
          {IconComponent && (
            <View style={styles.iconContainer}>
              <IconComponent size={iconSize} />
            </View>
          )}

          {/* Activity name */}
          <Text style={styles.activityName}>
            {activityName.charAt(0).toUpperCase() + activityName.slice(1)}
          </Text>
          <Text style={styles.activityHint}>Short, fun, and easy to finish.</Text>

          {/* Voice replay */}
          <View style={styles.voiceRow}>
            <VoiceButton text={`Today's adventure is ${activityName}. Ready to play?`} />
            <Text style={styles.voiceRowText}>Tap to hear</Text>
          </View>
        </View>

        {/* Completion status or start button */}
        {completed ? (
          <View>
            <View style={styles.completedContainer}>
              <Text style={styles.completedText}>✨ Completed</Text>
            </View>
            <View style={styles.completedButtonsContainer}>
              <TouchableOpacity
                onPress={handleStartPress}
                style={styles.startButton}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePlaygroundPress}
                style={styles.playgroundButton}
                activeOpacity={0.8}
              >
                <Text style={styles.playgroundButtonText}>🎮 Go to Playground</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleStartPress}
            style={styles.startButton}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Today</Text>
          </TouchableOpacity>
        )}

        {/* Description text */}
        <Text style={styles.descriptionText}>
          One bright activity per day
        </Text>

        {/* Age selector button */}
        <TouchableOpacity
          onPress={() => setShowAgeSelector(true)}
          style={styles.ageSelectorButton}
          activeOpacity={0.7}
        >
          <Text style={styles.ageSelectorButtonText}>
            👧 I'm {currentAgeBand} years old
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Age selector modal */}
      {showAgeSelector && (
        <TouchableOpacity
          style={styles.ageModalOverlay}
          activeOpacity={1}
          onPress={() => setShowAgeSelector(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.ageModalContent}>
              <Text style={styles.ageModalTitle}>How old are you?</Text>
              <ScrollView
                style={styles.ageOptionsScroll}
                contentContainerStyle={styles.ageOptionsContainer}
                showsVerticalScrollIndicator={false}
              >
                {(['3-4', '5-6', '7-8'] as AgeBand[]).map((band) => (
                  <TouchableOpacity
                    key={band}
                    onPress={() => handleAgeBandChange(band)}
                    style={[
                      styles.ageOption,
                      currentAgeBand === band
                        ? styles.ageOptionActive
                        : styles.ageOptionInactive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.ageOptionText}>{band} years</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Parent corner modal */}
      <ParentCornerModal
        visible={parentCornerVisible}
        onClose={() => {
          setParentCornerVisible(false);
          // Refresh home data after modal closes
          loadHome(false);
        }}
      />
    </View>
  );
}
