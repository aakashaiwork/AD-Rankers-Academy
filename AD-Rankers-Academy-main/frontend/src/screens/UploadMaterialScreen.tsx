import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import { readAssetAsDataUrl } from '../utils/readAssetAsDataUrl';
import { useTheme } from '../context/ThemeContext';

import { API_URL } from '../config/api';

const OBJECT_ID_HEX = /^[a-fA-F0-9]{24}$/;

type SubjectRow = { _id: string; name: string; categoryId: string };

export default function UploadMaterialScreen({ navigation }: any) {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<any>(null);
  const [fileData, setFileData] = useState('');
  const [fileType, setFileType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/subjects`);
      const data = await response.json();
      const list: SubjectRow[] = data.subjects || [];
      setSubjects(list);
      setSubjectId((prev) => {
        if (prev && list.some((s) => s._id === prev)) return prev;
        return list[0]?._id ?? '';
      });
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchSubjects();
    }, [fetchSubjects])
  );

  const selectedSubject = subjects.find((s) => s._id === subjectId);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const selectedFile = result.assets[0];
      setFile(selectedFile);

      const base64Data = await readAssetAsDataUrl(selectedFile);
      setFileData(base64Data);

      const mimeType = selectedFile.mimeType || 'application/octet-stream';
      if (mimeType.startsWith('image/')) {
        setFileType('image');
      } else if (mimeType === 'application/pdf') {
        setFileType('pdf');
      } else {
        setFileType('file');
      }
    } catch (error) {
      console.error('[Upload Material] pickFile error:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleSubmit = async () => {
    console.log('[Upload Material] submit pressed');
    if (!title || !subjectId || !description || !fileData) {
      const msg = 'Please fill in all fields and select a file';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
      return;
    }
    if (!selectedSubject?.categoryId) {
      const msg = 'Invalid subject selection';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
      return;
    }

    const categoryId = String(selectedSubject.categoryId).trim();
    const subjectIdTrim = String(subjectId).trim();

    if (!OBJECT_ID_HEX.test(categoryId)) {
      console.error('[Upload Material] invalid categoryId (not 24-hex ObjectId):', categoryId);
      const msg = 'Invalid category id from subject. Re-fetch subjects or fix data in DB.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
      return;
    }
    if (!OBJECT_ID_HEX.test(subjectIdTrim)) {
      console.error('[Upload Material] invalid subjectId (not 24-hex ObjectId):', subjectIdTrim);
      const msg = 'Pick a valid subject (id must be a MongoDB ObjectId).';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
      return;
    }

    const payload = {
      title,
      categoryId,
      subjectId: subjectIdTrim,
      description,
      fileData,
      fileType,
    };

    console.log('[Upload Material] POST', `${API_URL}/api/materials?token=<redacted>`);
    console.log('[Upload Material] Content-Type: application/json (not multipart)');
    console.log('[Upload Material] body (fileData truncated):', {
      ...payload,
      fileData:
        fileData.length > 120
          ? `${fileData.slice(0, 120)}... (total chars=${fileData.length})`
          : fileData,
    });

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/materials?token=${encodeURIComponent(token || '')}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();
      if (!response.ok) {
        let detail = responseText;
        try {
          const j = JSON.parse(responseText);
          if (Array.isArray(j.detail)) {
            detail = JSON.stringify(j.detail);
          } else if (j.detail != null) {
            detail = String(j.detail);
          }
        } catch {
          /* keep responseText */
        }
        console.error(
          '[Upload Material] HTTP error',
          response.status,
          detail || responseText
        );
        throw new Error(detail || `HTTP ${response.status}`);
      }

      console.log('[Upload Material] success:', responseText);

      if (Platform.OS === 'web') {
        window.alert('Material uploaded successfully');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Material uploaded successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('[Upload Material] submit error:', error);
      const msg = error instanceof Error ? error.message : 'Failed to upload material';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Enter material title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: colors.text }]}>Subject</Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Picker
              selectedValue={subjectId}
              onValueChange={setSubjectId}
              style={styles.picker}
            >
              {subjects.length === 0 ? (
                <Picker.Item label="No subjects — add some in Manage Subjects" value="" />
              ) : (
                subjects.map((subj) => (
                  <Picker.Item key={subj._id} label={subj.name} value={subj._id} />
                ))
              )}
            </Picker>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Enter description"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.label, { color: colors.text }]}>File (PDF or Image)</Text>
          <TouchableOpacity style={[styles.filePicker, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={pickFile}>
            <Ionicons name="cloud-upload-outline" size={32} color="#6366f1" />
            <Text style={[styles.filePickerText, { color: colors.text }]}>
              {file ? file.name : 'Tap to select file'}
            </Text>
            {file && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#10b981"
              />
            )}
          </TouchableOpacity>

          {fileType === 'image' && fileData && (
            <Image source={{ uri: fileData }} style={styles.preview} resizeMode="contain" />
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Upload Material</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  filePicker: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  filePickerText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  fileSize: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});