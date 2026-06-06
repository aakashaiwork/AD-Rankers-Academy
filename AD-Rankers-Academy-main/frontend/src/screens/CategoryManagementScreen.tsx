import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';
import { mockData } from '../config/mockData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

type CategoryRow = {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
};

export default function CategoryManagementScreen() {
  const { token, user } = useAuth();
  const { colors } = useTheme();

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');

  const canManage = user?.role === 'admin' && !!token;

  const showMessage = (t: string, m: string) => {
    if (Platform.OS === 'web') window.alert(`${t}: ${m}`);
    else Alert.alert(t, m);
  };

  const confirmAction = async (message: string) => {
    if (Platform.OS === 'web') return window.confirm(message);
    return new Promise<boolean>((resolve) => {
      Alert.alert('Confirm', message, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'OK', style: 'destructive', onPress: () => resolve(true) },
      ]);
    });
  };

  const fetchCategories = useCallback(async () => {
    try {
      // Use persistent mock data - no network calls
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay
      setCategories(mockData.categories);
    } catch (e) {
      console.error('Failed to fetch categories', e);
      showMessage('Error', 'Failed to load categories');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    })();
  }, [fetchCategories]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [categories]);

  const createCategory = async () => {
    if (!canManage) {
      showMessage('Error', 'Admin access required');
      return;
    }

    const nameTrimmed = name.trim();
    if (!nameTrimmed) {
      showMessage('Error', 'Category name is required');
      return;
    }

    try {
      setSaving(true);
      // Mock category creation - no API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate creation
      
      // Add new category to persistent mock data
      const newCategory = {
        _id: Date.now().toString(),
        name: nameTrimmed,
        description: description.trim(),
        icon: icon.trim() || 'grid'
      };
      
      mockData.addCategory(newCategory);
      setCategories(mockData.categories);
      setName('');
      setDescription('');
      setIcon('');
      showMessage('Success', 'Category created');
    } catch (e: any) {
      showMessage('Error', e?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!canManage) {
      showMessage('Error', 'Admin access required');
      return;
    }

    const ok = await confirmAction(`Delete category "${categoryName}"?`);
    if (!ok) return;

    try {
      // Mock category deletion - no API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate deletion
      
      mockData.removeCategory(categoryId);
      setCategories(mockData.categories);
      showMessage('Success', 'Category deleted');
    } catch (e: any) {
      showMessage('Error', e?.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Create Category</Text>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>Categories appear in Create Course and subjects grouping</Text>

        {!canManage && (
          <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="alert-circle" size={18} color="#b45309" />
            <Text style={[styles.noticeText, { color: colors.text }]}>Admin access required</Text>
          </View>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g. SSC"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Short description"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Text style={[styles.label, { color: colors.text }]}>Icon (optional)</Text>
        <TextInput
          value={icon}
          onChangeText={setIcon}
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Ionicons name (e.g. grid)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, (!canManage || saving) && styles.primaryBtnDisabled]}
          disabled={!canManage || saving}
          onPress={createCategory}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Add Category</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Existing Categories</Text>
        {sortedCategories.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No categories yet</Text>
        ) : (
          sortedCategories.map((c) => (
            <View key={c._id} style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{c.name}</Text>
                {!!c.description && (
                  <Text style={[styles.rowSub, { color: colors.textMuted }]} numberOfLines={2}>
                    {c.description}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => deleteCategory(c._id, c.name)}
                disabled={!canManage}
                style={[styles.deleteBtn, !canManage && styles.deleteBtnDisabled]}
              >
                <Ionicons name="trash-outline" size={18} color={!canManage ? '#9ca3af' : '#ef4444'} />
                <Text style={[styles.deleteText, { color: !canManage ? colors.textMuted : '#ef4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
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
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subTitle: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
  },
  notice: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 12,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLeft: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSub: {
    marginTop: 4,
    fontSize: 12,
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
    backgroundColor: '#fef2f2',
  },
  deleteBtnDisabled: {
    borderColor: '#e5e7eb',
    backgroundColor: 'transparent',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '700',
  },
});