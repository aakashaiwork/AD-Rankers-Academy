import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { mockData } from '../config/mockData';

type CategoryRow = { _id: string; name: string };
type SubjectRow = { _id: string; name: string; categoryId: string };

export default function ManageSubjectsScreen() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Use mock data directly - no network calls
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay
      
      const cats = mockData.categories;
      const subs = mockData.subjects.map(s => ({ ...s, categoryId: cats[0]?._id || '1' }));
      setCategories(cats);
      setSubjects(subs);
      setCategoryId((prev) => {
        if (prev && cats.some((c) => c._id === prev)) return prev;
        return cats[0]?._id ?? '';
      });
    } catch (e) {
      console.error('Error loading subjects/categories:', e);
      Alert.alert('Error', 'Failed to load data. Check backend URL and network.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const categoryName = (id: string) =>
    categories.find((c) => c._id === id)?.name ?? '—';

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Error', 'Enter a subject name');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Select a category first');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'Not signed in');
      return;
    }

    setAdding(true);
    try {
      // Mock subject creation - no API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate creation
      
      const newSubject = {
        _id: Date.now().toString(),
        name,
        categoryId,
        description: newDescription.trim() || '—',
        icon: 'book'
      };
      
      setSubjects(prev => [...prev, newSubject]);
      setNewName('');
      setNewDescription('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to add subject');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (item: SubjectRow) => {
    if (!token) {
      if (Platform.OS === 'web') {
        window.alert('Not signed in');
      } else {
        Alert.alert('Error', 'Not signed in');
      }
      return;
    }

    const message = `Remove "${item.name}"? This does not remove existing materials/tests that reference it.`;

    const runDelete = async () => {
      setDeletingId(item._id);
      try {
        const response = await fetch(
          `${API_URL}/api/subjects/${item._id}?token=${encodeURIComponent(token)}`,
          { method: 'DELETE' }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to delete');
        }
        await loadData();
      } catch (e: any) {
        if (Platform.OS === 'web') {
          window.alert(e?.message || 'Failed to delete subject');
        } else {
          Alert.alert('Error', e?.message || 'Failed to delete subject');
        }
      } finally {
        setDeletingId(null);
      }
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm(message);
      if (!ok) return;
      void runDelete();
      return;
    }

    Alert.alert('Delete subject', message, [
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

  const renderItem = ({ item }: { item: SubjectRow }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={styles.categoryHint}>{categoryName(item.categoryId)}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        disabled={deletingId === item._id}
        style={styles.trashBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        {deletingId === item._id ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : (
          <Ionicons name="trash-outline" size={22} color="#ef4444" />
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No categories yet</Text>
        <Text style={styles.emptySub}>
          Create categories first (e.g. from category management), then you can add subjects here.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={categoryId} onValueChange={setCategoryId} style={styles.picker}>
            {categories.map((c) => (
              <Picker.Item key={c._id} label={c.name} value={c._id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Subject name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Algebra"
          value={newName}
          onChangeText={setNewName}
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Short description"
          value={newDescription}
          onChangeText={setNewDescription}
          multiline
        />

        <TouchableOpacity
          style={[styles.addBtn, adding && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={adding}
        >
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>Add Subject</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>All subjects</Text>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={subjects.length === 0 ? styles.emptyList : styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No subjects yet. Add one above.</Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  form: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  addBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnDisabled: {
    opacity: 0.7,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowText: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryHint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  trashBtn: {
    padding: 8,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
