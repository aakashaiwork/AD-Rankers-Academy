import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';

type CourseItem = {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  isPaid?: boolean;
  accessType?: 'free' | 'subscription' | 'paid';
  price?: number;
  duration?: number;
  videoIds?: string[];
  materialIds?: string[];
  testIds?: string[];
  hasAccess?: boolean;
  videos?: { _id: string; title: string; url?: string; description?: string }[];
  materials?: { _id: string; title: string; description?: string }[];
  tests?: { _id: string; title: string; duration?: number }[];
};

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { token } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseItem | null>(null);

  const showMessage = (t: string, m: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${t}: ${m}`);
    } else {
      Alert.alert(t, m);
    }
  };

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/api/courses/${courseId}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      setCourse(data);
    } catch (e: any) {
      console.error('Error loading course:', e);
      showMessage('Error', e?.message || 'Failed to load course');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [courseId, token, navigation]);

  const subscribe = async () => {
    if (!token) {
      showMessage('Error', 'Please login first');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/subscribe?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30, type: 'subscription' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      showMessage('Success', 'Subscription activated');
      void fetchCourse();
    } catch (e: any) {
      showMessage('Error', e?.message || 'Failed to subscribe');
    }
  };

  const buyCourse = async () => {
    if (!token) {
      showMessage('Error', 'Please login first');
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/api/purchase/course/${courseId}?token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days: 30 }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      showMessage('Success', 'Course purchased');
      void fetchCourse();
    } catch (e: any) {
      showMessage('Error', e?.message || 'Failed to purchase course');
    }
  };

  useEffect(() => {
    void fetchCourse();
  }, [fetchCourse]);

  const openVideo = async (url?: string) => {
    if (!url) return;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error('Cannot open URL');
      await Linking.openURL(url);
    } catch {
      showMessage('Error', 'Failed to open video');
    }
  };

  if (loading || !course) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const isLocked = !!course.isPaid && !course.hasAccess;
  const accessType = course.accessType || (course.isPaid ? 'paid' : 'free');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{course.title}</Text>

        <View style={styles.badgeRow}>
          {course.isPaid ? (
            <View style={styles.paidBadge}>
              <Ionicons name="pricetag" size={14} color="#fff" />
              <Text style={styles.badgeText}>₹{course.price || 0}</Text>
            </View>
          ) : (
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>FREE</Text>
            </View>
          )}

          {accessType === 'subscription' && (
            <View style={styles.subBadge}>
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.subText}>SUBSCRIPTION</Text>
            </View>
          )}

          {course.isPaid && (course.duration || 0) > 0 && (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color="#6366f1" />
              <Text style={styles.durationText}>{course.duration} days</Text>
            </View>
          )}
        </View>

        <Text style={[styles.description, { color: colors.textMuted }]}>{course.description}</Text>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{course.videoIds?.length || 0} videos</Text>
          <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{course.materialIds?.length || 0} materials</Text>
          <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{course.testIds?.length || 0} tests</Text>
        </View>
      </View>

      {isLocked && (
        <View style={[styles.lockBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="lock-closed" size={18} color="#b45309" />
          <View style={styles.lockRight}>
            <Text style={[styles.lockText, { color: colors.text }]}>
              You can see the overview, but videos/materials/tests are locked.
            </Text>
            {accessType === 'subscription' ? (
              <TouchableOpacity style={styles.ctaBtn} onPress={subscribe}>
                <Ionicons name="flash" size={18} color="#fff" />
                <Text style={styles.ctaText}>Subscribe (Demo)</Text>
              </TouchableOpacity>
            ) : accessType === 'paid' ? (
              <TouchableOpacity style={styles.ctaBtn} onPress={buyCourse}>
                <Ionicons name="card" size={18} color="#fff" />
                <Text style={styles.ctaText}>Buy Course (Demo)</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}

      {!isLocked && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Videos</Text>
          {(course.videos || []).length === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>No videos in this course</Text>
          ) : (
            (course.videos || []).map((v) => (
              <TouchableOpacity
                key={v._id}
                style={[styles.itemRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => openVideo(v.url)}
              >
                <Ionicons name="play-circle" size={22} color="#ef4444" />
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{v.title}</Text>
                  {!!v.description && (
                    <Text style={styles.itemSub} numberOfLines={2}>
                      {v.description}
                    </Text>
                  )}
                </View>
                <Ionicons name="open-outline" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ))
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Study Materials</Text>
          {(course.materials || []).length === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>No materials in this course</Text>
          ) : (
            (course.materials || []).map((m) => (
              <TouchableOpacity
                key={m._id}
                style={[styles.itemRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('MaterialViewer', { materialId: m._id })}
              >
                <Ionicons name="document-text" size={20} color="#10b981" />
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{m.title}</Text>
                  {!!m.description && (
                    <Text style={styles.itemSub} numberOfLines={2}>
                      {m.description}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ))
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tests</Text>
          {(course.tests || []).length === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>No tests in this course</Text>
          ) : (
            (course.tests || []).map((t) => (
              <TouchableOpacity
                key={t._id}
                style={[styles.itemRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('TakeTest', { testId: t._id })}
              >
                <Ionicons name="clipboard" size={20} color="#6366f1" />
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t.title}</Text>
                  {!!t.duration && (
                    <Text style={styles.itemSub}>{t.duration} min</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  description: {
    marginTop: 10,
    color: '#4b5563',
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#10b981',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '800',
  },
  freeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#6366f1',
  },
  freeText: {
    color: '#fff',
    fontWeight: '800',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  durationText: {
    color: '#4338ca',
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  metaText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  metaDot: {
    marginHorizontal: 8,
    color: '#d1d5db',
  },
  lockBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    marginBottom: 6,
  },
  lockText: {
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 20,
  },
  lockRight: {
    flex: 1,
  },
  ctaBtn: {
    marginTop: 10,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
  },
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#0ea5e9',
  },
  subText: {
    color: '#fff',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 14,
    marginBottom: 10,
  },
  emptyHint: {
    color: '#6b7280',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '800',
    color: '#111827',
  },
  itemSub: {
    marginTop: 2,
    color: '#6b7280',
  },
});