import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';
import { mockData } from '../config/mockData';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function TestsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [tests, setTests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Use mock data directly - no network calls
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay
      setTests(mockData.tests);
      setSubjects(mockData.subjects);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredTests = selectedSubject === 'all' 
    ? tests 
    : tests.filter((test: any) => test.subject === selectedSubject);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.card,
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    headerSubtitle: {
      color: colors.textMuted,
      fontSize: 14,
    },
    filterContainer: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterScrollView: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 12,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    activeFilter: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    inactiveFilter: {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '600',
    },
    activeFilterText: {
      color: 'white',
    },
    inactiveFilterText: {
      color: colors.textMuted,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
    },
    testCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    testHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    testIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    testContent: {
      flex: 1,
    },
    testTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    testBadges: {
      flexDirection: 'row',
      gap: 8,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    subjectBadge: {
      backgroundColor: colors.primary + '20',
    },
    subjectBadgeText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    difficultyBadge: {
      backgroundColor: '#10b98120',
    },
    easyBadge: {
      backgroundColor: '#10b98120',
    },
    mediumBadge: {
      backgroundColor: '#f59e0b20',
    },
    hardBadge: {
      backgroundColor: '#ef444420',
    },
    difficultyBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    easyText: {
      color: '#10b981',
    },
    mediumText: {
      color: '#f59e0b',
    },
    hardText: {
      color: '#ef4444',
    },
    testMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '500',
    },
    startButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    startButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  const renderTest = ({ item: test }: any) => (
    <TouchableOpacity
      style={styles.testCard}
      onPress={() => navigation.navigate('TakeTest', { testId: test._id })}
    >
      <View style={styles.testHeader}>
        <View style={styles.testIcon}>
          <Ionicons name="document-text" size={24} color={colors.primary} />
        </View>
        <View style={styles.testContent}>
          <Text style={styles.testTitle} numberOfLines={2}>
            {test.title}
          </Text>
          <View style={styles.testBadges}>
            <View style={[styles.badge, styles.subjectBadge]}>
              <Text style={styles.subjectBadgeText}>{test.subject}</Text>
            </View>
            {test.difficulty && (
              <View style={[
                styles.badge, 
                styles.difficultyBadge,
                test.difficulty === 'easy' ? styles.easyBadge :
                test.difficulty === 'medium' ? styles.mediumBadge : styles.hardBadge
              ]}>
                <Text style={[
                  styles.difficultyBadgeText,
                  test.difficulty === 'easy' ? styles.easyText :
                  test.difficulty === 'medium' ? styles.mediumText : styles.hardText
                ]}>
                  {test.difficulty}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.testMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{test.duration} min</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="help-circle-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{test.questions?.length || 0} questions</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="medal-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{test.totalMarks} marks</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Start Test</Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.emptyText}>Loading tests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mock Tests {'\ud83d\udcdd'}</Text>
        <Text style={styles.headerSubtitle}>Challenge yourself with practice tests</Text>
      </View>

      {/* Subject Filters */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollView}
        >
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSubject === 'all' ? styles.activeFilter : styles.inactiveFilter
              ]}
              onPress={() => setSelectedSubject('all')}
            >
              <Text style={[
                styles.filterText,
                selectedSubject === 'all' ? styles.activeFilterText : styles.inactiveFilterText
              ]}>
                All Tests
              </Text>
            </TouchableOpacity>

            {subjects.map((subject: any) => (
              <TouchableOpacity
                key={subject._id}
                style={[
                  styles.filterChip,
                  selectedSubject === subject.name ? styles.activeFilter : styles.inactiveFilter
                ]}
                onPress={() => setSelectedSubject(subject.name)}
              >
                <Text style={[
                  styles.filterText,
                  selectedSubject === subject.name ? styles.activeFilterText : styles.inactiveFilterText
                ]}>
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tests List */}
      <View style={styles.content}>
        {filteredTests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Tests Available</Text>
            <Text style={styles.emptyText}>
              {selectedSubject === 'all' 
                ? "No tests have been created yet. Check back later!"
                : `No tests available for ${selectedSubject}. Try another subject.`
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTests}
            renderItem={renderTest}
            keyExtractor={(item: any) => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </View>
  );
}
