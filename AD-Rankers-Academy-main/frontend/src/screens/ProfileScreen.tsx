import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { mockData } from '../config/mockData';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { colors, mode, setMode } = useTheme();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      // Use mock data directly - no network calls
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay
      setLeaderboard(mockData.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      marginBottom: 24,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    userName: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    userEmail: {
      color: colors.textMuted,
      fontSize: 16,
      marginBottom: 12,
    },
    roleBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    roleText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    adminButton: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    adminButtonText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    adminIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    themeLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    themeButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    themeButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
    },
    activeTheme: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    inactiveTheme: {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    themeButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    activeThemeText: {
      color: 'white',
    },
    inactiveThemeText: {
      color: colors.text,
    },
    leaderboardCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    loadingContainer: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    loadingText: {
      color: colors.textMuted,
      marginTop: 12,
      fontSize: 14,
    },
    emptyContainer: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
    },
    leaderboardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
    },
    currentUserItem: {
      backgroundColor: colors.background,
      borderColor: colors.primary,
      borderWidth: 2,
    },
    otherUserItem: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
    },
    rankBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    topRankBadge: {
      backgroundColor: colors.danger + '20',
    },
    otherRankBadge: {
      backgroundColor: colors.textMuted + '20',
    },
    rankNumber: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    topRankText: {
      color: colors.danger,
    },
    otherRankText: {
      color: colors.textMuted,
    },
    userContent: {
      flex: 1,
    },
    userNameText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    userStats: {
      color: colors.textMuted,
      fontSize: 12,
    },
    userScore: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: 'bold',
    },
    logoutButton: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    logoutButtonText: {
      color: colors.danger,
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      alignItems: 'center',
      paddingTop: 16,
    },
    versionText: {
      color: colors.textMuted,
      fontSize: 12,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color={colors.primary} />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Admin Panel Button */}
        {user?.role === 'admin' && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('Admin')}
          >
            <View style={styles.adminIcon}>
              <Ionicons name="settings" size={24} color={colors.primary} />
            </View>
            <Text style={styles.adminButtonText}>Admin Panel</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Theme Settings */}
        <View style={styles.themeCard}>
          <Text style={styles.sectionTitle}>Appearance {'\ud83c\udfa8'}</Text>
          <Text style={styles.themeLabel}>Theme</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                mode === 'system' ? styles.activeTheme : styles.inactiveTheme
              ]}
              onPress={() => setMode('system')}
            >
              <Text style={[
                styles.themeButtonText,
                mode === 'system' ? styles.activeThemeText : styles.inactiveThemeText
              ]}>
                System
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                mode === 'light' ? styles.activeTheme : styles.inactiveTheme
              ]}
              onPress={() => setMode('light')}
            >
              <Text style={[
                styles.themeButtonText,
                mode === 'light' ? styles.activeThemeText : styles.inactiveThemeText
              ]}>
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                mode === 'dark' ? styles.activeTheme : styles.inactiveTheme
              ]}
              onPress={() => setMode('dark')}
            >
              <Text style={[
                styles.themeButtonText,
                mode === 'dark' ? styles.activeThemeText : styles.inactiveThemeText
              ]}>
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.sectionTitle}>{'\ud83c\udfc6'} Leaderboard</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading leaderboard...</Text>
            </View>
          ) : leaderboard.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="trophy-outline" size={30} color={colors.primary} />
              </View>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          ) : (
            leaderboard.slice(0, 10).map((entry: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.leaderboardItem,
                  entry.name === user?.name ? styles.currentUserItem : styles.otherUserItem
                ]}
              >
                <View style={[
                  styles.rankBadge,
                  entry.rank <= 3 ? styles.topRankBadge : styles.otherRankBadge
                ]}>
                  <Text style={[
                    styles.rankNumber,
                    entry.rank <= 3 ? styles.topRankText : styles.otherRankText
                  ]}>
                    #{entry.rank}
                  </Text>
                </View>
                <View style={styles.userContent}>
                  <Text style={styles.userNameText}>{entry.name}</Text>
                  <Text style={styles.userStats}>{entry.testsCompleted} tests completed</Text>
                </View>
                <Text style={styles.userScore}>{entry.totalScore}</Text>
              </View>
            ))
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
