import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { mockData } from '../config/mockData';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      // Use mock data directly - no network calls
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay
      setStats(mockData.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textMuted,
      marginTop: 12,
      fontSize: 16,
    },
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    welcomeText: {
      color: colors.textMuted,
      fontSize: 16,
      fontWeight: '500',
    },
    userName: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'bold',
      marginTop: 4,
    },
    statusBadge: {
      backgroundColor: '#10b981',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    statusText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      elevation: 4,
    },
    primaryGradient: {
      backgroundColor: '#6366f1',
    },
    secondaryGradient: {
      backgroundColor: '#f59e0b',
    },
    statNumber: {
      color: 'white',
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statLabel: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 14,
      fontWeight: '600',
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    actionCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
    },
    actionDescription: {
      color: colors.textMuted,
      fontSize: 14,
    },
    recentResultsCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    resultIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    resultContent: {
      flex: 1,
    },
    resultScore: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    resultDate: {
      color: colors.textMuted,
      fontSize: 12,
    },
    percentageBadge: {
      backgroundColor: '#10b98120',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    percentageText: {
      color: '#10b981',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}! {'\ud83d\udc4b'}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.primaryGradient]}>
            <Text style={styles.statNumber}>{stats?.user?.progress?.totalScore || 0}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
          <View style={[styles.statCard, styles.secondaryGradient]}>
            <Text style={styles.statNumber}>{stats?.user?.progress?.completedTests?.length || 0}</Text>
            <Text style={styles.statLabel}>Tests Taken</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Tests')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="clipboard-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Take a Test</Text>
            <Text style={styles.actionDescription}>Challenge yourself with quizzes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Study')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="book-outline" size={24} color="#10b981" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Study Materials</Text>
            <Text style={styles.actionDescription}>Download notes & PDFs</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Videos')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#fef3f2' }]}>
            <Ionicons name="play-circle-outline" size={24} color="#ef4444" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Watch Videos</Text>
            <Text style={styles.actionDescription}>Learn from expert instructors</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Recent Results */}
        {stats?.recentAttempts && stats.recentAttempts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Test Results</Text>
            {stats.recentAttempts.slice(0, 3).map((attempt: any, index: number) => (
              <View key={index} style={styles.recentResultsCard}>
                <View style={styles.resultHeader}>
                  <View style={[
                    styles.resultIcon,
                    { backgroundColor: attempt.score >= attempt.totalMarks * 0.6 ? '#10b98120' : '#ef444420' }
                  ]}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={attempt.score >= attempt.totalMarks * 0.6 ? '#10b981' : '#ef4444'}
                    />
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultScore}>{attempt.score}/{attempt.totalMarks}</Text>
                    <Text style={styles.resultDate}>
                      {new Date(attempt.attemptedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.percentageBadge}>
                    <Text style={styles.percentageText}>
                      {Math.round((attempt.score / attempt.totalMarks) * 100)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
