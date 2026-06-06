import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';

export default function CreateTestScreen({ navigation }: any) {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('30');
  const [questions, setQuestions] = useState([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1,
  }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/subjects`);
      const data = await response.json();
      setSubjects(data.subjects || []);
      if (data.subjects && data.subjects.length > 0) {
        setSubject(data.subjects[0].name);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1,
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      Alert.alert('Error', 'Test must have at least one question');
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!title || !subject) {
      Alert.alert('Error', 'Please fill in test title and subject');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        Alert.alert('Error', `Question ${i + 1} is empty`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        Alert.alert('Error', `Question ${i + 1} has empty options`);
        return;
      }
    }

    setLoading(true);
    try {
      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
      const response = await fetch(`${API_URL}/api/tests?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          subject,
          duration: parseInt(duration),
          totalMarks,
          questions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create test');
      }

      Alert.alert('Success', 'Test created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create test');
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
          <Text style={[styles.label, { color: colors.text }]}>Test Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Enter test title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: colors.text }]}>Subject</Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Picker
              selectedValue={subject}
              onValueChange={setSubject}
              style={styles.picker}
            >
              {subjects.map((subj: any) => (
                <Picker.Item key={subj._id} label={subj.name} value={subj.name} />
              ))}
            </Picker>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Duration (minutes)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="30"
            placeholderTextColor={colors.textMuted}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
          />

          <View style={styles.questionsHeader}>
            <Text style={styles.sectionTitle}>Questions</Text>
            <TouchableOpacity style={styles.addButton} onPress={addQuestion}>
              <Ionicons name="add-circle" size={24} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {questions.map((q, qIndex) => (
            <View key={qIndex} style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.questionHeader}>
                <Text style={[styles.questionNumber, { color: colors.text }]}>Question {qIndex + 1}</Text>
                {questions.length > 1 && (
                  <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[styles.input, styles.questionInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter question"
                placeholderTextColor={colors.textMuted}
                value={q.question}
                onChangeText={(text) => updateQuestion(qIndex, 'question', text)}
                multiline
              />

              <Text style={[styles.optionsLabel, { color: colors.text }]}>Options</Text>
              {q.options.map((opt, oIndex) => (
                <View key={oIndex} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.correctRadio,
                      q.correctAnswer === oIndex && styles.correctRadioSelected,
                    ]}
                    onPress={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                  >
                    {q.correctAnswer === oIndex && (
                      <View style={styles.correctRadioInner} />
                    )}
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.optionInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    placeholder={`Option ${oIndex + 1}`}
                    placeholderTextColor={colors.textMuted}
                    value={opt}
                    onChangeText={(text) => updateOption(qIndex, oIndex, text)}
                  />
                </View>
              ))}

              <Text style={[styles.hint, { color: colors.textMuted }]}>Tap the circle to mark the correct answer</Text>
            </View>
          ))}
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
            <Text style={styles.submitButtonText}>Create Test</Text>
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
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    padding: 4,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  questionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  correctRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctRadioSelected: {
    borderColor: '#10b981',
  },
  correctRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  optionInput: {
    flex: 1,
    marginBottom: 0,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
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