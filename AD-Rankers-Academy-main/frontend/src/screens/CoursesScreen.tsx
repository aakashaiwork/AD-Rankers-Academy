import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { mockData } from '../config/mockData';
import { useTheme } from '../context/ThemeContext';

export default function CoursesScreen({ navigation }: any) {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canManage = user?.role === 'admin' && !!token;

  const fetchData = useCallback(async () => {
    try {
      // Use mock data directly - no network calls
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay
      setCategories(mockData.categories);
      
      // Mock courses data
      const mockCourses = [
        {
          _id: '1',
          title: 'React Complete Course',
          description: 'Learn React from basics to advanced',
          categoryId: '1',
          thumbnail: '#',
          price: 99
        },
        {
          _id: '2',
          title: 'JavaScript Mastery',
          description: 'Master JavaScript concepts',
          categoryId: '1',
          thumbnail: '#',
          price: 79
        }
      ];
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const createCourse = () => {
    navigation.getParent()?.navigate('Admin', { screen: 'CreateCourse' });
  };

  const deleteCourse = (courseId: string, title: string) => {
    if (!token) {
      if (Platform.OS === 'web') {
        window.alert('Not signed in');
      } else {
        Alert.alert('Error', 'Not signed in');
      }
      return;
    }

    const message = `Remove "${title}"?`;

    const runDelete = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/courses/${courseId}?token=${encodeURIComponent(token)}`,
          { method: 'DELETE' }
        );
        const text = await response.text();
        if (!response.ok) {
          let detail = text;
          try {
            const j = JSON.parse(text);
            if (j?.detail != null) detail = String(j.detail);
          } catch {
            /* ignore */
          }
          throw new Error(detail || `HTTP ${response.status}`);
        }
        fetchData();
      } catch (e: any) {
        if (Platform.OS === 'web') {
          window.alert(e?.message || 'Failed to delete course');
        } else {
          Alert.alert('Error', e?.message || 'Failed to delete course');
        }
      }
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm(message);
      if (!ok) return;
      void runDelete();
      return;
    }

    Alert.alert('Delete course', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void runDelete();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Courses</Text>
            <Text style={[styles.headerSubtitle, { color: colors.primary }]}>AD Rankers Academy</Text>
          </View>
          {canManage && (
            <TouchableOpacity onPress={createCourse} style={styles.headerBtn}>
              <Ionicons name="add" size={22} color="#6366f1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.categoriesScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === 'all' && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === 'all' && styles.categoryChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((cat: any) => (
          <TouchableOpacity
            key={cat._id}
            style={[
              styles.categoryChip,
              { backgroundColor: colors.card },
              selectedCategory === cat._id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat._id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: colors.text },
                selectedCategory === cat._id && styles.categoryChipTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.coursesList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="albums-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No courses available</Text>
            <Text style={styles.emptyHint}>Check back later for new courses</Text>
          </View>
        ) : (
          courses.map((course: any) => (
            <View key={course._id} style={[styles.courseCard, { backgroundColor: colors.card }]}> 
              <TouchableOpacity
                onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                style={styles.courseMain}
              >
                <View style={styles.courseHeader}>
                  {course.thumbnail ? (
                    <Image source={{ uri: course.thumbnail }} style={styles.courseThumbnail} />
                  ) : (
                    <View style={styles.courseIconContainer}>
                      <Ionicons name="albums" size={40} color="#6366f1" />
                    </View>
                  )}
                  {course.isPaid && (
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceText}>₹{course.price}</Text>
                    </View>
                  )}
                  {!course.isPaid && (
                    <View style={styles.freeBadge}>
                      <Text style={styles.freeText}>FREE</Text>
                    </View>
                  )}
                  {course.isPaid && !course.hasAccess && (
                    <View style={styles.lockOverlay}>
                      <Ionicons name="lock-closed" size={24} color="#fff" />
                    </View>
                  )}
                </View>

                <View style={styles.courseInfo}>
                  <View style={styles.courseTitleRow}>
                    <Text style={[styles.courseTitle, { color: colors.text }]}>{course.title}</Text>
                    {canManage && (
                      <View style={styles.manageBtns}>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.getParent()?.navigate('Admin', {
                              screen: 'EditCourse',
                              params: { courseId: course._id },
                            })
                          }
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          style={styles.editBtn}
                        >
                          <Ionicons name="pencil-outline" size={18} color="#6366f1" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteCourse(course._id, course.title)}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {course.description}
                  </Text>

                  <View style={styles.courseMetaContainer}>
                    <View style={styles.courseMeta}>
                      <Ionicons name="play-circle-outline" size={16} color="#6b7280" />
                      <Text style={styles.metaText}>{course.videoIds?.length || 0} videos</Text>
                    </View>
                    <View style={styles.courseMeta}>
                      <Ionicons name="document-text-outline" size={16} color="#6b7280" />
                      <Text style={styles.metaText}>{course.materialIds?.length || 0} materials</Text>
                    </View>
                    <View style={styles.courseMeta}>
                      <Ionicons name="clipboard-outline" size={16} color="#6b7280" />
                      <Text style={styles.metaText}>{course.testIds?.length || 0} tests</Text>
                    </View>
                  </View>

                  {course.isPaid && course.duration > 0 && (
                    <View style={styles.durationBadge}>
                      <Ionicons name="time-outline" size={14} color="#6366f1" />
                      <Text style={styles.durationText}>{course.duration} days access</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  manageBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6366f1',
    marginTop: 4,
    fontWeight: '500',
  },
  categoriesScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoriesContainer: {
    padding: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  coursesList: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  courseMain: {
    flex: 1,
  },
  courseHeader: {
    position: 'relative',
    height: 160,
  },
  courseThumbnail: {
    width: '100%',
    height: '100%',
  },
  courseIconContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  freeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  freeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  courseDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
});