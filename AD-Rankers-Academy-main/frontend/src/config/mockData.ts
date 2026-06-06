// Mock data service for offline functionality
let persistentCategories = [
    { _id: '1', name: 'Frontend' },
    { _id: '2', name: 'Backend' },
    { _id: '3', name: 'Database' },
    { _id: '4', name: 'DevOps' }
];

let persistentSubjects = [
    { _id: '1', name: 'React', categoryId: '1' },
    { _id: '2', name: 'JavaScript', categoryId: '1' },
    { _id: '3', name: 'CSS', categoryId: '2' },
    { _id: '4', name: 'HTML', categoryId: '2' }
];

export const mockData = {
  // Dashboard data
  dashboard: {
    user: {
      progress: {
        totalScore: 1250,
        completedTests: 8
      }
    },
    recentAttempts: [
      {
        score: 85,
        totalMarks: 100,
        attemptedAt: new Date().toISOString()
      },
      {
        score: 92,
        totalMarks: 100,
        attemptedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        score: 78,
        totalMarks: 100,
        attemptedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  },

  // Tests data
  tests: [
    {
      _id: '1',
      title: 'React Fundamentals Quiz',
      subject: 'React',
      difficulty: 'easy',
      duration: 30,
      totalMarks: 100,
      questions: [
        { question: 'What is React?', options: ['Library', 'Framework', 'Language'], correct: 1 }
      ]
    },
    {
      _id: '2',
      title: 'JavaScript Advanced',
      subject: 'JavaScript',
      difficulty: 'medium',
      duration: 45,
      totalMarks: 150,
      questions: [
        { question: 'What is closure?', options: ['Function', 'Concept', 'Bug'], correct: 1 }
      ]
    },
    {
      _id: '3',
      title: 'CSS Grid Mastery',
      subject: 'CSS',
      difficulty: 'hard',
      duration: 60,
      totalMarks: 200,
      questions: [
        { question: 'What is CSS Grid?', options: ['Layout', 'Style', 'Animation'], correct: 0 }
      ]
    }
  ],

  // Categories data with persistence
  get categories() {
    return persistentCategories;
  },

  // Subjects data with persistence
  get subjects() {
    return persistentSubjects;
  },

  // Methods to update persistent data
  addCategory(category: any) {
    persistentCategories.push(category);
  },

  removeCategory(categoryId: string) {
    persistentCategories = persistentCategories.filter(cat => cat._id !== categoryId);
  },

  addSubject(subject: any) {
    persistentSubjects.push(subject);
  },

  removeSubject(subjectId: string) {
    persistentSubjects = persistentSubjects.filter(sub => sub._id !== subjectId);
  },

  // Leaderboard data
  leaderboard: [
    { rank: 1, name: 'John Doe', totalScore: 2450, testsCompleted: 15 },
    { rank: 2, name: 'Jane Smith', totalScore: 2180, testsCompleted: 12 },
    { rank: 3, name: 'Mike Johnson', totalScore: 1890, testsCompleted: 10 },
    { rank: 4, name: 'Sarah Wilson', totalScore: 1650, testsCompleted: 8 },
    { rank: 5, name: 'Tom Brown', totalScore: 1420, testsCompleted: 7 }
  ],

  // Materials data
  materials: [
    {
      _id: '1',
      title: 'React Basics Guide',
      subject: 'React',
      type: 'pdf',
      size: '2.5 MB',
      url: '#'
    },
    {
      _id: '2',
      title: 'JavaScript ES6 Notes',
      subject: 'JavaScript',
      type: 'pdf',
      size: '1.8 MB',
      url: '#'
    }
  ],

  // Videos data
  videos: [
    {
      _id: '1',
      title: 'React Hooks Tutorial',
      subject: 'React',
      duration: '45 min',
      thumbnail: '#',
      url: '#'
    },
    {
      _id: '2',
      title: 'JavaScript Async/Await',
      subject: 'JavaScript',
      duration: '30 min',
      thumbnail: '#',
      url: '#'
    }
  ]
};

// Mock fetch function
export const mockFetch = (endpoint: string, options?: any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (endpoint.includes('/profile')) {
        resolve({ ok: true, json: () => mockData.dashboard });
      } else if (endpoint.includes('/tests')) {
        resolve({ ok: true, json: () => mockData.tests });
      } else if (endpoint.includes('/subjects')) {
        resolve({ ok: true, json: () => mockData.subjects });
      } else if (endpoint.includes('/categories')) {
        resolve({ ok: true, json: () => mockData.categories });
      } else if (endpoint.includes('/leaderboard')) {
        resolve({ ok: true, json: () => mockData.leaderboard });
      } else if (endpoint.includes('/materials')) {
        resolve({ ok: true, json: () => mockData.materials });
      } else if (endpoint.includes('/videos')) {
        resolve({ ok: true, json: () => mockData.videos });
      } else {
        resolve({ ok: true, json: () => ({ success: true }) });
      }
    }, 300);
  });
};
