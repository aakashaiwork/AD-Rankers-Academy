import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';

export default function MaterialViewerScreen({ route, navigation }: any) {
  const { materialId } = route.params;
  const { colors } = useTheme();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMaterial = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/materials/${materialId}`);
      const data = await response.json();
      setMaterial(data);
    } catch (error) {
      console.error('Error fetching material:', error);
      Alert.alert('Error', 'Failed to load material');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [materialId, navigation]);

  useEffect(() => {
    fetchMaterial();
  }, [fetchMaterial]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!material) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={material.fileType === 'pdf' ? 'document-text' : 'image'}
            size={32}
            color="#6366f1"
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.text }]}>{material.title}</Text>
          <Text style={[styles.subject, { color: colors.primary }]}>{material.subject}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.textMuted }]}>{material.description}</Text>

        {material.fileType === 'image' ? (
          <Image
            source={{ uri: material.fileData }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.pdfContainer, { backgroundColor: colors.card }]}> 
            <Ionicons name="document-text-outline" size={64} color="#6b7280" />
            <Text style={[styles.pdfText, { color: colors.text }]}>PDF Document</Text>
            <Text style={[styles.pdfHint, { color: colors.textMuted }]}>
              PDF viewing is limited in this app. Download to view full content.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subject: {
    fontSize: 14,
    color: '#6366f1',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
  pdfContainer: {
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
  },
  pdfText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  pdfHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});