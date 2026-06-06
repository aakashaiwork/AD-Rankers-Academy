import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function VideosScreen() {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [videos, setVideos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canDelete = user?.role === 'admin' && !!token;

  const fetchData = useCallback(async () => {
    try {
      const [subjectsRes, videosRes] = await Promise.all([
        fetch(`${API_URL}/api/subjects`),
        fetch(
          `${API_URL}/api/videos${
            selectedSubject !== 'all' ? `?subject=${selectedSubject}` : ''
          }`
        ),
      ]);

      const subjectsData = await subjectsRes.json();
      const videosData = await videosRes.json();

      setSubjects(subjectsData.subjects || []);
      setVideos(videosData.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openVideo = (url: string) => {
    Linking.openURL(url);
  };

  const deleteVideo = (videoId: string, title: string) => {
    if (!token) {
      Alert.alert('Error', 'Not signed in');
      return;
    }
    Alert.alert('Delete video', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(
              `${API_URL}/api/videos/${videoId}?token=${encodeURIComponent(token)}`,
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
            Alert.alert('Error', e?.message || 'Failed to delete video');
          }
        },
      },
    ]);
  };

  const getYoutubeThumbnail = (url: string) => {
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Video Library</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.subjectsScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.subjectsContainer}
      >
        <TouchableOpacity
          style={[
            styles.subjectChip,
            selectedSubject === 'all' && styles.subjectChipActive,
          ]}
          onPress={() => setSelectedSubject('all')}
        >
          <Text
            style={[
              styles.subjectChipText,
              selectedSubject === 'all' && styles.subjectChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {subjects.map((subject: any) => (
          <TouchableOpacity
            key={subject._id}
            style={[
              styles.subjectChip,
              selectedSubject === subject.name && styles.subjectChipActive,
            ]}
            onPress={() => setSelectedSubject(subject.name)}
          >
            <Text
              style={[
                styles.subjectChipText,
                selectedSubject === subject.name && styles.subjectChipTextActive,
              ]}
            >
              {subject.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.videosList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {videos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="play-circle-outline" size={64} color="#d1d5db" />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No videos available</Text>
          </View>
        ) : (
          videos.map((video: any) => (
            <TouchableOpacity
              key={video._id}
              style={[styles.videoCard, { backgroundColor: colors.card }]}
              onPress={() => openVideo(video.youtubeUrl)}
            >
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: getYoutubeThumbnail(video.youtubeUrl) }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.playIconOverlay}>
                  <Ionicons name="play-circle" size={48} color="#fff" />
                </View>
              </View>
              <View style={styles.videoInfo}>
                <Text style={[styles.videoTitle, { color: colors.text }]}>{video.title}</Text>
                <Text style={[styles.videoSubject, { color: colors.primary }]}>{video.subject}</Text>
                <Text style={[styles.videoDescription, { color: colors.textMuted }]} numberOfLines={2}>
                  {video.description}
                </Text>
                {canDelete && (
                  <View style={styles.adminRow}>
                    <TouchableOpacity
                      onPress={() => deleteVideo(video._id, video.title)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subjectsScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  subjectsContainer: {
    padding: 16,
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  subjectChipActive: {
    backgroundColor: '#6366f1',
  },
  subjectChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  subjectChipTextActive: {
    color: '#fff',
  },
  videosList: {
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
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoInfo: {
    padding: 16,
  },
  adminRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff',
  },
  deleteText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  videoSubject: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
    fontWeight: '500',
  },
  videoDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
});