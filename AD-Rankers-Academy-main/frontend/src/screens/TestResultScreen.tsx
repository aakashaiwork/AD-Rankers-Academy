import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function TestResultScreen({ route, navigation }: any) {
  const { result } = route.params;
  const { colors } = useTheme();
  const percentage = result.percentage || 0;
  const isPassed = percentage >= 60;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, isPassed ? styles.passIcon : styles.failIcon]}>
          <Ionicons
            name={isPassed ? 'checkmark-circle' : 'close-circle'}
            size={80}
            color="#fff"
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {isPassed ? 'You passed the test' : 'You can do better next time'}
        </Text>

        <View style={[styles.scoreCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>Your Score</Text>
          <Text style={styles.scoreValue}>
            {result.score}/{result.totalMarks}
          </Text>
          <Text style={[styles.percentageValue, { color: colors.textMuted }]}>{percentage.toFixed(1)}%</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: colors.card }]}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={[styles.statValue, { color: colors.text }]}>{result.score}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Correct</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.card }]}>
            <Ionicons name="close-circle" size={24} color="#ef4444" />
            <Text style={[styles.statValue, { color: colors.text }]}>{result.totalMarks - result.score}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Incorrect</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.card }]}>
            <Ionicons name="medal" size={24} color="#f59e0b" />
            <Text style={[styles.statValue, { color: colors.text }]}>{result.totalMarks}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Tests' })}
        >
          <Text style={styles.buttonText}>Take Another Test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  passIcon: {
    backgroundColor: '#10b981',
  },
  failIcon: {
    backgroundColor: '#ef4444',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  percentageValue: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  secondaryButtonText: {
    color: '#6366f1',
  },
});