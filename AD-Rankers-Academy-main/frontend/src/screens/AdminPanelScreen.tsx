import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';

export default function AdminPanelScreen({ navigation }: any) {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats?token=${token}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Ionicons name="stats-chart" size={48} color="#6366f1" />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#6366f1' }]}>
          <Ionicons name="people" size={32} color="#fff" />
          <Text style={styles.statValue}>{stats?.totalStudents || 0}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
          <Ionicons name="clipboard" size={32} color="#fff" />
          <Text style={styles.statValue}>{stats?.totalTests || 0}</Text>
          <Text style={styles.statLabel}>Tests</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Ionicons name="book" size={32} color="#fff" />
          <Text style={styles.statValue}>{stats?.totalMaterials || 0}</Text>
          <Text style={styles.statLabel}>Materials</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
          <Ionicons name="play-circle" size={32} color="#fff" />
          <Text style={styles.statValue}>{stats?.totalVideos || 0}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Content Management</Text>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('CreateTest')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="add-circle" size={24} color="#6366f1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Create New Test</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Add questions and configure test</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('BulkTestUpload')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}>
            <Ionicons name="cloud-upload" size={24} color="#6366f1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Bulk Upload Test (DOCX/XLSX)</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Upload Word/Excel to generate MCQs automatically</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('ManageSubjects')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}>
            <Ionicons name="library" size={24} color="#6366f1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Manage Subjects</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Add or remove exam subjects</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('CategoryManagement')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}
          >
            <Ionicons name="grid" size={24} color="#6366f1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Manage Categories</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Add or remove exam categories</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.getParent()?.navigate('MainTabs', { screen: 'Study' })}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="book" size={24} color="#10b981" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>View Materials</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>See all uploaded study materials</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.getParent()?.navigate('MainTabs', { screen: 'Videos' })}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="play-circle" size={24} color="#ef4444" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>View Videos</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>See all uploaded videos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('UploadMaterial')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="cloud-upload" size={24} color="#10b981" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Upload Study Material</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Add PDFs, images, and notes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('UploadVideo')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#fef2f2' }]}> 
            <Ionicons name="videocam" size={24} color="#ef4444" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Add Video</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Upload YouTube video links</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('CreateCourse')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}> 
            <Ionicons name="albums" size={24} color="#6366f1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Create Course</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Bundle videos, materials and tests</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.getParent()?.navigate('MainTabs', { screen: 'Courses' })}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}> 
            <Ionicons name="albums-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>View Courses</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>See all courses and manage access</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="information-circle" size={24} color="#6366f1" />
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Total Test Attempts</Text>
          <Text style={styles.infoValue}>{stats?.totalAttempts || 0}</Text>
        </View>
      </View>
    </ScrollView>
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
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoContent: {
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginTop: 4,
  },
});