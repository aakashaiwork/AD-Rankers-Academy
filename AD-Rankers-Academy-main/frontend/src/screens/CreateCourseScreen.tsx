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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { mockData } from '../config/mockData';
import { useTheme } from '../context/ThemeContext';

type CategoryRow = { _id: string; name: string };
type SubjectRow = { _id: string; name: string; categoryId: string };
type VideoRow = { _id: string; title: string; subject?: string; description?: string };
type MaterialRow = { _id: string; title: string; subject?: string; description?: string };
type TestRow = { _id: string; title: string };

export default function CreateCourseScreen({ navigation }: any) {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [tests, setTests] = useState<TestRow[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const [accessType, setAccessType] = useState<'free' | 'subscription' | 'paid'>('free');
  const [price, setPrice] = useState('0');
  const [duration, setDuration] = useState('0');

  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  const canManage = user?.role === 'admin' && !!token;

  const showMessage = (t: string, m: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${t}: ${m}`);
    } else {
      Alert.alert(t, m);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Use mock data directly - no network calls
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay
      
      const cats = mockData.categories;
      const subs = mockData.subjects.map(s => ({ ...s, categoryId: cats[0]?._id || '1' }));
      setCategories(cats);
      setSubjects(subs);
      setVideos(mockData.videos);
      setMaterials(mockData.materials);
      setTests(mockData.tests);

      setCategoryId((prev) => prev || cats[0]?._id || '');
      setSubjectId((prev) => {
        if (prev && subs.some((s) => s._id === prev)) return prev;
        const firstInCat = subs.find((s) => s.categoryId === (cats[0]?._id || ''));
        return firstInCat?._id || subs[0]?._id || '';
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to load data. Check backend URL and network.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const subjectsForCategory = useMemo(() => {
    if (!categoryId) return subjects;
    return subjects.filter((s) => s.categoryId === categoryId);
  }, [categoryId, subjects]);

  useEffect(() => {
    if (!subjectId) return;
    if (subjectsForCategory.some((s) => s._id === subjectId)) return;
    setSubjectId(subjectsForCategory[0]?._id || '');
  }, [subjectId, subjectsForCategory]);

  const toggleId = (id: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleSave = async () => {
    const t = title.trim();
    const d = description.trim();
    if (!canManage) {
      showMessage('Error', 'Admin access required');
      return;
    }
    if (!t) {
      showMessage('Error', 'Enter a course title');
      return;
    }
    if (!d) {
      showMessage('Error', 'Enter a course description');
      return;
    }
    if (!categoryId) {
      showMessage('Error', 'Select a category');
      return;
    }
    if (!subjectId) {
      showMessage('Error', 'Select a subject');
      return;
    }
    const priceNum = Number(price || '0');
    const durationNum = Number(duration || '0');
    if (Number.isNaN(priceNum) || priceNum < 0) {
      showMessage('Error', 'Invalid price');
      return;
    }
    if (Number.isNaN(durationNum) || durationNum < 0) {
      showMessage('Error', 'Invalid duration');
      return;
    }

    setSaving(true);
    try {
      // Mock course creation - no API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate creation
      
      if (Platform.OS === 'web') {
        window.alert('Course created successfully');
      } else {
        Alert.alert('Success', 'Course created successfully');
      }
      navigation.goBack();
    } catch (e: any) {
      showMessage('Error', e?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {!canManage && (
        <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="alert-circle" size={18} color="#b45309" />
          <Text style={[styles.noticeText, { color: colors.text }]}>Admin access required to create courses.</Text>
        </View>
      )}

      <Text style={[styles.label, { color: colors.text }]}>Title</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        value={title}
        onChangeText={setTitle}
        placeholder="Course title"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={[styles.label, { color: colors.text }]}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Course description"
        placeholderTextColor={colors.textMuted}
        multiline
      />

      <Text style={[styles.label, { color: colors.text }]}>Thumbnail URL (optional)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        value={thumbnail}
        onChangeText={setThumbnail}
        placeholder="https://..."
        placeholderTextColor={colors.textMuted}
      />

      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      <View style={[styles.pickerWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Picker selectedValue={categoryId} onValueChange={setCategoryId} style={styles.picker}>
          {categories.map((c) => (
            <Picker.Item key={c._id} label={c.name} value={c._id} />
          ))}
        </Picker>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Subject</Text>
      <View style={[styles.pickerWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Picker selectedValue={subjectId} onValueChange={setSubjectId} style={styles.picker}>
          {subjectsForCategory.map((s) => (
            <Picker.Item key={s._id} label={s.name} value={s._id} />
          ))}
        </Picker>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Access Type</Text>
      <View style={[styles.pickerWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Picker selectedValue={accessType} onValueChange={setAccessType} style={styles.picker}>
          <Picker.Item label="Free (everyone)" value="free" />
          <Picker.Item label="Subscription (auto unlock with subscription)" value="subscription" />
          <Picker.Item label="Paid (individual purchase required)" value="paid" />
        </Picker>
      </View>

      {accessType === 'paid' && (
        <View style={[styles.paidBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Price (₹)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: colors.text }]}>Access duration (days)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={duration}
            onChangeText={setDuration}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Add videos</Text>
      {videos.length === 0 ? (
        <Text style={[styles.emptyHint, { color: colors.textMuted }]}>No videos found</Text>
      ) : (
        videos.map((v) => (
          <TouchableOpacity
            key={v._id}
            style={[styles.selectRow, { backgroundColor: colors.card, borderColor: colors.border }, selectedVideoIds.includes(v._id) && styles.selectRowActive]}
            onPress={() => toggleId(v._id, selectedVideoIds, setSelectedVideoIds)}
          >
            <Ionicons
              name={selectedVideoIds.includes(v._id) ? 'checkbox' : 'square-outline'}
              size={20}
              color={selectedVideoIds.includes(v._id) ? '#6366f1' : '#9ca3af'}
            />
            <Text style={[styles.selectTitle, { color: colors.text }]} numberOfLines={2}>
              {v.title}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Add materials</Text>
      {materials.length === 0 ? (
        <Text style={[styles.emptyHint, { color: colors.textMuted }]}>No materials found</Text>
      ) : (
        materials.map((m) => (
          <TouchableOpacity
            key={m._id}
            style={[
              styles.selectRow,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedMaterialIds.includes(m._id) && styles.selectRowActive,
            ]}
            onPress={() => toggleId(m._id, selectedMaterialIds, setSelectedMaterialIds)}
          >
            <Ionicons
              name={selectedMaterialIds.includes(m._id) ? 'checkbox' : 'square-outline'}
              size={20}
              color={selectedMaterialIds.includes(m._id) ? '#6366f1' : '#9ca3af'}
            />
            <Text style={[styles.selectTitle, { color: colors.text }]} numberOfLines={2}>
              {m.title}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Add tests</Text>
      {tests.length === 0 ? (
        <Text style={[styles.emptyHint, { color: colors.textMuted }]}>No tests found</Text>
      ) : (
        tests.map((tRow) => (
          <TouchableOpacity
            key={tRow._id}
            style={[styles.selectRow, { backgroundColor: colors.card, borderColor: colors.border }, selectedTestIds.includes(tRow._id) && styles.selectRowActive]}
            onPress={() => toggleId(tRow._id, selectedTestIds, setSelectedTestIds)}
          >
            <Ionicons
              name={selectedTestIds.includes(tRow._id) ? 'checkbox' : 'square-outline'}
              size={20}
              color={selectedTestIds.includes(tRow._id) ? '#6366f1' : '#9ca3af'}
            />
            <Text style={[styles.selectTitle, { color: colors.text }]} numberOfLines={2}>
              {tRow.title}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={[styles.saveBtn, (!canManage || saving) && styles.saveBtnDisabled]}
        disabled={!canManage || saving}
        onPress={handleSave}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Create Course</Text>}
      </TouchableOpacity>
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
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    marginBottom: 12,
  },
  noticeText: {
    color: '#92400e',
    fontWeight: '600',
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
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  picker: {
    height: 48,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggle: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  toggleOn: {
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
  },
  toggleText: {
    fontWeight: '700',
    color: '#6b7280',
  },
  toggleTextOn: {
    color: '#4338ca',
  },
  paidBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
    marginBottom: 10,
  },
  emptyHint: {
    color: '#6b7280',
    marginBottom: 12,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  selectRowActive: {
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
  },
  selectTitle: {
    flex: 1,
    color: '#111827',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});