import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@exam.com');
    setPassword('admin123');
    await handleLogin();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    content: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoBackground: {
      width: 100,
      height: 100,
      borderRadius: 30,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    appName: {
      color: colors.text,
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    tagline: {
      color: colors.textMuted,
      fontSize: 16,
      textAlign: 'center',
    },
    loginCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 32,
      marginBottom: 24,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    welcomeTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    welcomeSubtitle: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 24,
    },
    label: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    input: {
      flex: 1,
      height: 48,
      color: colors.text,
      fontSize: 16,
      marginLeft: 12,
    },
    inputIcon: {
      color: colors.textMuted,
    },
    loginButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 24,
      boxShadow: `0 2px 4px ${colors.primary}33`,
      elevation: 4,
    },
    loginButtonDisabled: {
      backgroundColor: colors.primary + '40',
      opacity: 0.6,
    },
    loginButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    registerText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    registerLink: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
    demoContainer: {
      alignItems: 'center',
      gap: 16,
    },
    divider: {
      width: '100%',
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 16,
    },
    demoTitle: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
    demoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      gap: 8,
    },
    demoButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Ionicons name="school-outline" size={50} color={colors.primary} />
              </View>
              <Text style={styles.appName}>AD Rankers Academy</Text>
              <Text style={styles.tagline}>Your gateway to academic excellence</Text>
            </View>

            {/* Login Form */}
            <View style={styles.loginCard}>
              <Text style={styles.welcomeTitle}>Welcome Back {'\ud83d\udc4b'}</Text>
              <Text style={styles.welcomeSubtitle}>Sign in to continue your learning journey</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (loading || !email || !password) && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Demo Section */}
            <View style={styles.demoContainer}>
              <View style={styles.divider} />
              <Text style={styles.demoTitle}>Quick Demo Access</Text>
              <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
                <Ionicons name="flash-outline" size={16} color={colors.primary} />
                <Text style={styles.demoButtonText}>Try Demo Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
