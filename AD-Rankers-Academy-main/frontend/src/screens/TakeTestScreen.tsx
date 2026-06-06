import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  marks?: number;
};

type Test = {
  _id: string;
  title: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
};

export default function TakeTestScreen({ route, navigation }: any) {
  const { testId } = route.params;
  const { token } = useAuth();
  const { colors } = useTheme();
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTest = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/tests/${testId}`);
      const data = await response.json();
      setTest(data);
      setTimeLeft(data.duration * 60); // Convert minutes to seconds
      setAnswers(new Array(data.questions.length).fill(-1));
    } catch (error) {
      console.error('Error fetching test:', error);
      Alert.alert('Error', 'Failed to load test');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [testId, navigation]);

  useEffect(() => {
    void fetchTest();
  }, [fetchTest]);

  const submitTest = useCallback(async () => {
    if (submitting) return;
    if (!test) return;

    setSubmitting(true);
    const timeTaken = (test.duration * 60) - timeLeft;

    try {
      const response = await fetch(`${API_URL}/api/tests/submit?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId: test._id,
          answers,
          timeTaken,
        }),
      });

      const result = await response.json();
      navigation.replace('TestResult', { result });
    } catch (error) {
      console.error('Error submitting test:', error);
      Alert.alert('Error', 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, test, token, timeLeft, answers, navigation]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          void submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitTest]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const unanswered = answers.filter((a) => a === -1).length;
    if (unanswered > 0) {
      Alert.alert(
        'Submit Test',
        `You have ${unanswered} unanswered questions. Are you sure you want to submit?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: submitTest },
        ]
      );
    } else {
      submitTest();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!test) return null;

  const question = test.questions[currentQuestion];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.progressContainer}>
          <Text style={styles.questionCount}>
            Question {currentQuestion + 1}/{test.questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestion + 1) / test.questions.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
        <View style={[styles.timerContainer, timeLeft < 60 && styles.timerWarning]}>
          <Ionicons name="time-outline" size={20} color={timeLeft < 60 ? '#ef4444' : '#6366f1'} />
          <Text style={[styles.timerText, timeLeft < 60 && styles.timerTextWarning]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.questionText, { color: colors.text }]}>{question.question}</Text>

        <View style={styles.optionsContainer}>
          {question.options.map((option: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                answers[currentQuestion] === index && styles.optionSelected,
              ]}
              onPress={() => handleAnswer(index)}
            >
              <View
                style={[
                  styles.optionRadio,
                  answers[currentQuestion] === index && styles.optionRadioSelected,
                ]}
              >
                {answers[currentQuestion] === index && (
                  <View style={styles.optionRadioInner} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  answers[currentQuestion] === index && styles.optionTextSelected,
                  { color: colors.text },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestion === 0 && styles.navButtonDisabled,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => setCurrentQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentQuestion === 0 ? '#d1d5db' : colors.text}
          />
          <Text
            style={[
              styles.navButtonText,
              currentQuestion === 0 && styles.navButtonTextDisabled,
              { color: colors.text },
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestion === test.questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Test</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setCurrentQuestion(currentQuestion + 1)}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#6366f1" />
          </TouchableOpacity>
        )}
      </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressContainer: {
    marginBottom: 12,
  },
  questionCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  timerWarning: {
    backgroundColor: '#fef2f2',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  timerTextWarning: {
    color: '#ef4444',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eff6ff',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: '#6366f1',
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  optionTextSelected: {
    color: '#6366f1',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
    gap: 6,
  },
  navButtonDisabled: {
    borderColor: '#e5e7eb',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  navButtonTextDisabled: {
    color: '#d1d5db',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    gap: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});