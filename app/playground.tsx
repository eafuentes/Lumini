import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Icons from '../src/components/icons';

type ActivityId = 'colors' | 'shapes' | 'numbers' | 'patterns' | 'memory' | 'sorting' | 'logic';

const activities: Array<{
  id: ActivityId;
  name: string;
  icon: React.FC<any>;
  description: string;
  emoji: string;
}> = [
  { id: 'colors', name: 'Colors', icon: Icons.ColorIcon, description: 'Learn colors', emoji: '🎨' },
  { id: 'shapes', name: 'Shapes', icon: Icons.ShapeIcon, description: 'Find shapes', emoji: '▲' },
  { id: 'numbers', name: 'Numbers', icon: Icons.NumberIcon, description: 'Count numbers', emoji: '🔢' },
  { id: 'patterns', name: 'Patterns', icon: Icons.PatternIcon, description: 'Match patterns', emoji: '🎭' },
  { id: 'memory', name: 'Memory', icon: Icons.MemoryIcon, description: 'Test memory', emoji: '🧠' },
  { id: 'sorting', name: 'Sorting', icon: Icons.SortingIcon, description: 'Sort items', emoji: '📦' },
  { id: 'logic', name: 'Logic', icon: Icons.LogicIcon, description: 'Solve puzzles', emoji: '🧩' },
];

export default function PlaygroundScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const iconSize = Math.min(width - 64, 100);

  const handleActivityPress = (activityId: ActivityId) => {
    router.push({
      pathname: '/activity',
      params: { activityId },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF9E6',
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: insets.top + 12,
      paddingBottom: 24,
    },
    headerTitle: {
      fontSize: 36,
      fontWeight: '900',
      color: '#1a1a1a',
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: '#666',
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingBottom: 32,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
    },
    activityCard: {
      width: '48%',
      backgroundColor: 'white',
      borderRadius: 24,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      alignItems: 'center',
    },
    activityEmoji: {
      fontSize: 40,
      marginBottom: 12,
    },
    activityIcon: {
      marginBottom: 12,
    },
    activityName: {
      fontSize: 18,
      fontWeight: '800',
      color: '#1a1a1a',
      marginBottom: 4,
      textAlign: 'center',
    },
    activityDescription: {
      fontSize: 12,
      color: '#888',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 Playground</Text>
        <Text style={styles.headerSubtitle}>Practice any activity!</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.gridContainer}>
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <TouchableOpacity
                key={activity.id}
                onPress={() => handleActivityPress(activity.id)}
                style={styles.activityCard}
                activeOpacity={0.7}
              >
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <View style={styles.activityIcon}>
                  <IconComponent size={iconSize / 2} />
                </View>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
