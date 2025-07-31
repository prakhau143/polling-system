import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userType: null, // 'teacher' or 'student'
  studentName: '',
  studentId: '',
  currentPoll: null,
  results: [],
  hasAnswered: false,
  students: [],
  canCreatePoll: true,
  pollHistory: [],
  timeRemaining: 0,
  isConnected: false,
  error: null,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    setStudentInfo: (state, action) => {
      state.studentName = action.payload.name;
      state.studentId = action.payload.studentId;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    setPollState: (state, action) => {
      const { currentPoll, results, hasAnswered, students, canCreatePoll } = action.payload;
      state.currentPoll = currentPoll;
      state.results = results || [];
      state.hasAnswered = hasAnswered || false;
      state.students = students || [];
      state.canCreatePoll = canCreatePoll !== undefined ? canCreatePoll : true;
    },
    setCurrentPoll: (state, action) => {
      state.currentPoll = action.payload;
      state.hasAnswered = false;
      state.results = [];
      state.timeRemaining = action.payload?.timeLimit || 60;
    },
    setResults: (state, action) => {
      state.results = action.payload;
    },
    setHasAnswered: (state, action) => {
      state.hasAnswered = action.payload;
    },
    updateStudents: (state, action) => {
      state.students = action.payload;
    },
    setCanCreatePoll: (state, action) => {
      state.canCreatePoll = action.payload;
    },
    setPollHistory: (state, action) => {
      state.pollHistory = action.payload;
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    decrementTime: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPoll: (state) => {
      state.currentPoll = null;
      state.results = [];
      state.hasAnswered = false;
      state.timeRemaining = 0;
      state.canCreatePoll = true;
    },
  },
});

export const {
  setUserType,
  setStudentInfo,
  setConnectionStatus,
  setPollState,
  setCurrentPoll,
  setResults,
  setHasAnswered,
  updateStudents,
  setCanCreatePoll,
  setPollHistory,
  setTimeRemaining,
  decrementTime,
  setError,
  clearError,
  resetPoll,
} = pollSlice.actions;

export default pollSlice.reducer;
