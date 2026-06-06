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
import { useTheme } from '../context/ThemeContext';

type CategoryRow = { _id: string; name: string };
type SubjectRow = { _id: string; name: string; categoryId: string };
type VideoRow = { _id: string; title: string; subject?: string; description?: string };
type MaterialRow = { _id: string; title: string; subject?: string; description?: string };
type TestRow = { _id: string; title: string };

type CourseResponse = {
  _id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  categoryId?: string;
  subjectId?: string;
  accessType?: 'free' | 'subscription' | 'paid';
  price?: number;
  duration?: number;
  videoIds?: string[];
  materialIds?: string[];
  testIds?: string[];
};

export default function EditCourseScreen({ route, navigation }: any) {
  const { courseId } = route.params || {};
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
    if (!courseId) {
      showMessage('Error', 'Missing courseId');
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const [catRes, subRes, vidRes, matRes, testRes, courseRes] = await Promise.all([
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/subjects`),
        fetch(`${API_URL}/api/videos`),
        fetch(`${API_URL}/api/materials`),
        fetch(`${API_URL}/api/tests`),
        fetch(`${API_URL}/api/courses/${courseId}?token=${token}`),
      ]);

      const catData = await catRes.json();
      const subData = await subRes.json();
      const vidData = await vidRes.json();
      const matData = await matRes.json();
      const testData = await testRes.json();
      const courseData: CourseResponse = await courseRes.json();

      const cats: CategoryRow[] = catData.categories || [];
      const subs: SubjectRow[] = subData.subjects || [];

      setCategories(cats);
      setSubjects(subs);
      setVideos(vidData.videos || []);
      setMaterials(matData.materials || []);
      setTests(testData.tests || []);

      setTitle(courseData.title || '');
      setDescription(courseData.description || '');
      setThumbnail(courseData.thumbnail || '');

      setCategoryId(courseData.categoryId || cats[0]?._id || '');
      setSubjectId(courseData.subjectId || subs[0]?._id || '');

      const at = (courseData.accessType || (courseData as any).isPaid ? 'paid' : 'free') as any;
      setAccessType(at === 'subscription' || at === 'paid' ? at : 'free');

      setPrice(String(courseData.price ?? 0));
      setDuration(String(courseData.duration ?? 0));

      setSelectedVideoIds(courseData.videoIds || []);
      setSelectedMaterialIds(courseData.materialIds || []);
      setSelectedTestIds(courseData.testIds || []);
    } catch (e) {
      console.error('Error loading edit course data:', e);
      showMessage('Error', 'Failed to load course data. Check backend URL and network.');
    } finally {
      setLoading(false);
    }
  }, [courseId, navigation, token]);

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
    if (!canManage) {
      showMessage('Error', 'Admin access required');
      return;
    }
    if (!courseId) {
      showMessage('Error', 'Missing courseId');
      return;
    }
    if (!title.trim() || !categoryId || !subjectId) {
      showMessage('Error', 'Please fill required fields (title, category, subject).');
      return;
    }

    setSaving(true);
    try {
      const body: any = {
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnail.trim(),
        categoryId,
        subjectId,
        accessType,
        price: accessType === 'paid' ? Number(price || 0) : 0,
        duration: accessType === 'paid' ? Number(duration || 0) : 0,
        videoIds: selectedVideoIds,
        materialIds: selectedMaterialIds,
        testIds: selectedTestIds,
      };

      const res = await fetch(`${API_URL}/api/courses/${courseId}?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        showMessage('Error', data?.detail || 'Failed to update course');
        return;
      }

      showMessage('Success', 'Course updated successfully');
      navigation.goBack();
    } catch (e) {
      console.error('Error updating course:', e);
      showMessage('Error', 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="create" size={28} color="#6366f1" />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Course</Text>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
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

      <Text style={[styles.label, { color: colors.text }]}>Thumbnail URL</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        value={thumbnail}
        onChangeText={setThumbnail}
        placeholder="https://..."
        placeholderTextColor={colors.textMuted}
      />

      <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
      <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Picker selectedValue={categoryId} onValueChange={(v) => setCategoryId(String(v))}>
          {categories.map((c) => (
            <Picker.Item key={c._id} label={c.name} value={c._id} />
          ))}
        </Picker>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Subject *</Text>
      <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Picker selectedValue={subjectId} onValueChange={(v) => setSubjectId(String(v))}>
          {subjectsForCategory.map((s) => (
            <Picker.Item key={s._id} label={s.name} value={s._id} />
          ))}
        </Picker>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Access Type</Text>
      <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Picker selectedValue={accessType} onValueChange={(v) => setAccessType(v)}>
          <Picker.Item label="Free" value="free" />
          <Picker.Item label="Subscription" value="subscription" />
          <Picker.Item label="Paid" value="paid" />
        </Picker>
      </View>

      {accessType === 'paid' && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Price (₹)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.text }]}>Access Duration (days)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </>
      )}

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Bundle Content</Text>

        <Text style={[styles.subTitle, { color: colors.text }]}>Videos</Text>
        {videos.map((v) => (
          <TouchableOpacity
            key={v._id}
            style={[styles.selectRow, { borderColor: colors.border }, selectedVideoIds.includes(v._id) && styles.selectRowSelected]}
            onPress={() => toggleId(v._id, selectedVideoIds, setSelectedVideoIds)}
          >
            <Text style={[styles.selectText, { color: colors.text }]} numberOfLines={1}>
              {v.title}
            </Text>
            {selectedVideoIds.includes(v._id) && <Ionicons name="checkmark" size={18} color="#10b981" />}
          </TouchableOpacity>
        ))}

        <Text style={[styles.subTitle, { color: colors.text }]}>Materials</Text>
        {materials.map((m) => (
          <TouchableOpacity
            key={m._id}
            style={[styles.selectRow, { borderColor: colors.border }, selectedMaterialIds.includes(m._id) && styles.selectRowSelected]}
            onPress={() => toggleId(m._id, selectedMaterialIds, setSelectedMaterialIds)}
          >
            <Text style={[styles.selectText, { color: colors.text }]} numberOfLines={1}>
              {m.title}
            </Text>
            {selectedMaterialIds.includes(m._id) && <Ionicons name="checkmark" size={18} color="#10b981" />}
          </TouchableOpacity>
        ))}

        <Text style={[styles.subTitle, { color: colors.text }]}>Tests</Text>
        {tests.map((t) => (
          <TouchableOpacity
            key={t._id}
            style={[styles.selectRow, { borderColor: colors.border }, selectedTestIds.includes(t._id) && styles.selectRowSelected]}
            onPress={() => toggleId(t._id, selectedTestIds, setSelectedTestIds)}
          >
            <Text style={[styles.selectText, { color: colors.text }]} numberOfLines={1}>
              {t.title}
            </Text>
            {selectedTestIds.includes(t._id) && <Ionicons name="checkmark" size={18} color="#10b981" />}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 28 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  section: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  subTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 10, marginBottom: 6 },
  selectRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectRowSelected: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
  selectText: { flex: 1, marginRight: 10, color: '#111827' },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
