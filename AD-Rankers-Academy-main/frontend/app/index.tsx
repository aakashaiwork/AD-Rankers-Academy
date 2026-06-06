import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

// Screens
import LoginScreen from '../src/screens/LoginScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import HomeScreen from '../src/screens/HomeScreen';
import TestsScreen from '../src/screens/TestsScreen';
import TakeTestScreen from '../src/screens/TakeTestScreen';
import TestResultScreen from '../src/screens/TestResultScreen';
import StudyScreen from '../src/screens/StudyScreen';
import MaterialViewerScreen from '../src/screens/MaterialViewerScreen';
import VideosScreen from '../src/screens/VideosScreen';
import CoursesScreen from '../src/screens/CoursesScreen';
import CourseDetailScreen from '../src/screens/CourseDetailScreen';
import ProfileScreen from '../src/screens/ProfileScreen';
import AdminPanelScreen from '../src/screens/AdminPanelScreen';
import CreateTestScreen from '../src/screens/CreateTestScreen';
import UploadMaterialScreen from '../src/screens/UploadMaterialScreen';
import UploadVideoScreen from '../src/screens/UploadVideoScreen';
import BulkTestUploadScreen from '../src/screens/BulkTestUploadScreen';
import CreateCourseScreen from '../src/screens/CreateCourseScreen';
import EditCourseScreen from '../src/screens/EditCourseScreen';
import CategoryManagementScreen from '../src/screens/CategoryManagementScreen';
import ManageSubjectsScreen from '../src/screens/ManageSubjectsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AdminNavigator() {
  const { colors } = useTheme();
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AdminStack.Screen name="AdminPanel" component={AdminPanelScreen} options={{ title: 'Admin Panel' }} />
      <AdminStack.Screen name="CreateTest" component={CreateTestScreen} options={{ title: 'Create Test' }} />
      <AdminStack.Screen name="BulkTestUpload" component={BulkTestUploadScreen} options={{ title: 'Bulk Upload Test' }} />
      <AdminStack.Screen name="UploadMaterial" component={UploadMaterialScreen} options={{ title: 'Upload Material' }} />
      <AdminStack.Screen name="UploadVideo" component={UploadVideoScreen} options={{ title: 'Upload Video' }} />
      <AdminStack.Screen name="CreateCourse" component={CreateCourseScreen} options={{ title: 'Create Course' }} />
      <AdminStack.Screen name="EditCourse" component={EditCourseScreen} options={{ title: 'Edit Course' }} />
      <AdminStack.Screen name="CategoryManagement" component={CategoryManagementScreen} options={{ title: 'Manage Categories' }} />
      <AdminStack.Screen name="ManageSubjects" component={ManageSubjectsScreen} options={{ title: 'Manage Subjects' }} />
    </AdminStack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tests') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Courses') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'Study') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Videos') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarItemStyle: { paddingVertical: 4 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tests" component={TestsScreen} />
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="Study" component={StudyScreen} />
      <Tab.Screen name="Videos" component={VideosScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="TakeTest" component={TakeTestScreen} options={{ headerShown: true, title: 'Take Test' }} />
      <Stack.Screen name="TestResult" component={TestResultScreen} options={{ headerShown: true, title: 'Test Result' }} />
      <Stack.Screen name="MaterialViewer" component={MaterialViewerScreen} options={{ headerShown: true, title: 'Study Material' }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ headerShown: true, title: 'Course Details' }} />
      <Stack.Screen name="Admin" component={AdminNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user } = useAuth();
  return user ? <AppNavigator /> : <AuthNavigator />;
}


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}