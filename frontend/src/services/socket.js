import { io } from 'socket.io-client';
import {
  setConnectionStatus,
  setPollState,
  setCurrentPoll,
  setResults,
  setHasAnswered,
  updateStudents,
  setCanCreatePoll,
  setPollHistory,
  setError,
  resetPoll,
} from '../store/pollSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.store = null;
  }

  connect(store) {
    this.store = store;
    this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001');

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.store.dispatch(setConnectionStatus(true));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.store.dispatch(setConnectionStatus(false));
    });

    this.socket.on('poll-state', (data) => {
      this.store.dispatch(setPollState(data));
    });

    this.socket.on('new-poll', (poll) => {
      this.store.dispatch(setCurrentPoll(poll));
    });

    this.socket.on('poll-created', (data) => {
      this.store.dispatch(setPollState(data));
    });

    this.socket.on('answer-submitted', (data) => {
      this.store.dispatch(setResults(data.results));
      this.store.dispatch(setHasAnswered(true));
    });

    this.socket.on('poll-progress', (data) => {
      this.store.dispatch(setResults(data.results));
      this.store.dispatch(setCanCreatePoll(data.canCreatePoll));
    });

    this.socket.on('poll-ended', (data) => {
      this.store.dispatch(setResults(data.results));
      this.store.dispatch(resetPoll());
    });

    this.socket.on('student-joined', (data) => {
      console.log('Student joined:', data.name);
    });

    this.socket.on('student-left', (data) => {
      console.log('Student left:', data.name);
    });

    this.socket.on('poll-history', (history) => {
      this.store.dispatch(setPollHistory(history));
    });

    this.socket.on('new-message', (data) => {
      console.log('New message:', data);
    });

    this.socket.on('error', (error) => {
      this.store.dispatch(setError(error));
      console.error('Socket error:', error);
    });

    this.socket.on('removed', (data) => {
      alert(data.message || 'You have been removed from the exam by the teacher.');
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    this.socket.on('paper-submitted', (data) => {
      alert(data.message);
      // Will be disconnected by server
    });

    this.socket.on('student-submitted-paper', (data) => {
      console.log('Student submitted paper:', data.name);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinAsTeacher() {
    if (this.socket) {
      this.socket.emit('join-as-teacher');
    }
  }

  joinAsStudent(name, studentId) {
    if (this.socket) {
      this.socket.emit('join-as-student', { name, studentId });
    }
  }

  createPoll(pollData) {
    if (this.socket) {
      this.socket.emit('create-poll', pollData);
    }
  }

  submitAnswer(studentId, optionIndex) {
    if (this.socket) {
      this.socket.emit('submit-answer', { studentId, optionIndex });
    }
  }

  endPoll() {
    if (this.socket) {
      this.socket.emit('end-poll');
    }
  }

  getPollHistory() {
    if (this.socket) {
      this.socket.emit('get-poll-history');
    }
  }

  removeStudent(studentId) {
    if (this.socket) {
      this.socket.emit('remove-student', studentId);
    }
  }

  sendMessage(message, isPrivate = false, targetStudentId = null) {
    if (this.socket) {
      this.socket.emit('send-message', { message, isPrivate, targetStudentId });
    }
  }

  submitPaper(studentId) {
    if (this.socket) {
      this.socket.emit('submit-paper', { studentId });
    }
  }
}

export default new SocketService();
