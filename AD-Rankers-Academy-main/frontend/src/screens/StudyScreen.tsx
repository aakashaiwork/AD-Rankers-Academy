import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function StudyScreen({ navigation }: any) {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canDelete = user?.role === 'admin' && !!token;

  const fetchData = useCallback(async () => {
    try {
      const [subjectsRes, materialsRes] = await Promise.all([
        fetch(`${API_URL}/api/subjects`),
        fetch(
          `${API_URL}/api/materials${
            selectedSubject !== 'all' ? `?subject=${selectedSubject}` : ''
          }`
        ),
      ]);

      const subjectsData = await subjectsRes.json();
      const materialsData = await materialsRes.json();

      setSubjects(subjectsData.subjects || []);
      setMaterials(materialsData.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
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

  const deleteMaterial = (materialId: string, title: string) => {
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
          `${API_URL}/api/materials/${materialId}?token=${encodeURIComponent(token)}`,
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
          window.alert(e?.message || 'Failed to delete material');
        } else {
          Alert.alert('Error', e?.message || 'Failed to delete material');
        }
      }
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm(message);
      if (!ok) return;
      void runDelete();
      return;
    }

    Alert.alert('Delete material', message, [
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Study Materials</Text>
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
        style={styles.materialsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {materials.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#d1d5db" />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No materials available</Text>
          </View>
        ) : (
          materials.map((material: any) => (
            <View key={material._id} style={[styles.materialCard, { backgroundColor: colors.card }]}> 
              <TouchableOpacity
                style={styles.materialMain}
                onPress={() =>
                  navigation.navigate('MaterialViewer', { materialId: material._id })
                }
              >
                <View style={styles.materialIcon}>
                  <Ionicons
                    name={material.fileType === 'pdf' ? 'document-text' : 'image'}
                    size={24}
                    color="#10b981"
                  />
                </View>
                <View style={styles.materialInfo}>
                  <Text style={[styles.materialTitle, { color: colors.text }]}>{material.title}</Text>
                  <Text style={[styles.materialSubject, { color: colors.primary }]}>{material.subject}</Text>
                  <Text style={styles.materialDescription} numberOfLines={2}>
                    {material.description}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.materialRight}>
                {canDelete ? (
                  <TouchableOpacity
                    onPress={() => deleteMaterial(material._id, material.title)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                )}
              </View>
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
  materialsList: {
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
  materialCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  materialMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 12,
  },
  materialIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialInfo: {
    flex: 1,
    marginLeft: 12,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  materialSubject: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
    fontWeight: '500',
  },
  materialDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});