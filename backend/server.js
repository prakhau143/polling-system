const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage
let currentPoll = null;
let students = new Map(); // studentId -> { name, socketId, answered, submittedPaper, answerIndex }
let pollResults = new Map(); // optionIndex -> count
let pollHistory = [];
let pollTimer = null;
let teacher = null;
let correctAnswerIndex = null; // Set by teacher when creating poll
let submittedStudents = new Set(); // Track students who submitted their paper

// Helper functions
function resetPoll() {
  currentPoll = null;
  pollResults.clear();
  students.forEach(student => {
    student.answered = false;
  });
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

function canCreateNewPoll() {
  if (!currentPoll) return true;
  
  // Check if all students have answered
  const totalStudents = students.size;
  const answeredStudents = Array.from(students.values()).filter(s => s.answered).length;
  
  return answeredStudents === totalStudents;
}

function calculateResults() {
  const results = [];
  if (currentPoll) {
    currentPoll.options.forEach((option, index) => {
      results.push({
        option,
        count: pollResults.get(index) || 0
      });
    });
  }
  return results;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Teacher joins
  socket.on('join-as-teacher', () => {
    teacher = socket.id;
    socket.join('teacher');
    console.log('Teacher joined:', socket.id);
    
    // Send current poll state to teacher
    socket.emit('poll-state', {
      currentPoll,
      students: Array.from(students.values()).map(s => ({ name: s.name, answered: s.answered })),
      results: calculateResults(),
      canCreatePoll: canCreateNewPoll()
    });
  });

  // Student joins
  socket.on('join-as-student', (data) => {
    const { name, studentId } = data;
    
    // Check if student with same name and ID already submitted paper
    const existingStudent = students.get(studentId);
    if (existingStudent && existingStudent.submittedPaper) {
      socket.emit('error', 'A student with this name and ID has already submitted their paper. You cannot rejoin.');
      return;
    }
    
    // Update or create student
    students.set(studentId, {
      name,
      studentId,
      socketId: socket.id,
      answered: currentPoll ? (existingStudent?.answered || false) : false,
      submittedPaper: existingStudent?.submittedPaper || false,
      answerIndex: existingStudent?.answerIndex || null
    });
    
    socket.join('students');
    console.log('Student joined:', name, studentId);
    
    const student = students.get(studentId);
    
    // Send current poll state to student
    socket.emit('poll-state', {
      currentPoll: currentPoll && !student.answered && !student.submittedPaper ? currentPoll : null,
      results: student.answered ? calculateResults() : null,
      hasAnswered: student.answered,
      submittedPaper: student.submittedPaper
    });
    
    // Notify teacher of new student
    if (teacher) {
      io.to('teacher').emit('student-joined', {
        name,
        totalStudents: students.size
      });
    }
  });

  // Teacher creates a poll
  socket.on('create-poll', (pollData) => {
    if (socket.id !== teacher) {
      socket.emit('error', 'Only teacher can create polls');
      return;
    }
    
    if (!canCreateNewPoll()) {
      socket.emit('error', 'Cannot create poll while students are still answering');
      return;
    }
    
    resetPoll();
    
    currentPoll = {
      question: pollData.question,
      options: pollData.options,
      timeLimit: pollData.timeLimit || 60,
      createdAt: new Date()
    };
    
    // Initialize poll results
    currentPoll.options.forEach((_, index) => {
      pollResults.set(index, 0);
    });
    
    console.log('Poll created:', currentPoll.question);
    
    // Send poll to all students
    io.to('students').emit('new-poll', currentPoll);
    
    // Send update to teacher
    socket.emit('poll-created', {
      currentPoll,
      canCreatePoll: false
    });
    
    // Set timer for auto-end poll
    pollTimer = setTimeout(() => {
      endPoll();
    }, currentPoll.timeLimit * 1000);
  });

// Student submits answer
  socket.on('submit-answer', (data) => {
    const { studentId, optionIndex } = data;
    const student = students.get(studentId);
    
    if (!student || student.socketId !== socket.id) {
      socket.emit('error', 'Invalid student');
      return;
    }
    
    if (!currentPoll) {
      socket.emit('error', 'No active poll');
      return;
    }
    
    if (student.answered) {
      socket.emit('error', 'Already answered');
      return;
    }
    
    // Record answer
    student.answered = true;
    student.answerIndex = optionIndex;
    const currentCount = pollResults.get(optionIndex) || 0;
    pollResults.set(optionIndex, currentCount + 1);
    
    console.log(`${student.name} answered option ${optionIndex}`);
    
    // Send results to student
    socket.emit('answer-submitted', {
      results: calculateResults()
    });

    // Detailed results for teacher with correct answer tracking
    const detailedResults = Array.from(students.values()).map(s => ({
      name: s.name,
      studentId: s.studentId,
      hasAnswered: s.answered,
      answerIndex: s.answerIndex,
      option: s.answered ? currentPoll.options[s.answerIndex] : "",
      isCorrect: correctAnswerIndex !== null && s.answerIndex === correctAnswerIndex
    }));

    // Calculate correct answers count
    const correctCount = correctAnswerIndex !== null ? 
      detailedResults.filter(s => s.hasAnswered && s.isCorrect).length : 0;

    // Update teacher with detailed results
    if (teacher) {
      io.to('teacher').emit('poll-progress', {
        answeredStudents: detailedResults,
        totalStudents: students.size,
        results: calculateResults(),
        correctCount,
        canCreatePoll: detailedResults.every(s => s.hasAnswered)
      });
    }

    // If all answered, end poll
    const allAnswered = detailedResults.every(s => s.hasAnswered);
    if (allAnswered) {
      endPoll();
    }
  });

  // Student submits paper (exits poll)
  socket.on('submit-paper', (data) => {
    const { studentId } = data;
    const student = students.get(studentId);
    
    if (!student || student.socketId !== socket.id) {
      socket.emit('error', 'Invalid student');
      return;
    }
    
    if (student.submittedPaper) {
      socket.emit('error', 'Paper already submitted');
      return;
    }
    
    // Mark paper as submitted
    student.submittedPaper = true;
    console.log(`${student.name} submitted their paper`);
    
    // Prepare student result data
    const studentResult = {
      name: student.name,
      studentId: student.studentId,
      hasAnswered: student.answered,
      answerIndex: student.answerIndex,
      option: student.answered && currentPoll ? currentPoll.options[student.answerIndex] : null,
      submittedAt: new Date().toISOString()
    };
    
    // Send confirmation to student
    socket.emit('paper-submitted', {
      message: 'Your paper has been submitted successfully. You will be disconnected in 3 seconds...'
    });
    
    // Notify teacher with student results
    if (teacher) {
      io.to('teacher').emit('student-submitted-paper', studentResult);
      
      // Update teacher with current poll state
      const remainingStudents = Array.from(students.values())
        .filter(s => !s.submittedPaper && s.studentId !== studentId)
        .map(s => ({ 
          name: s.name, 
          studentId: s.studentId,
          answered: s.answered 
        }));
      
      io.to('teacher').emit('poll-state', {
        currentPoll,
        students: remainingStudents,
        results: calculateResults(),
        canCreatePoll: canCreateNewPoll()
      });
    }
    
    // Remove student from active list and disconnect after delay
    setTimeout(() => {
      students.delete(studentId);
      socket.disconnect();
      console.log(`${student.name} disconnected after paper submission`);
    }, 3000);
  });

  // End poll function
  function endPoll() {
    if (!currentPoll) return;
    
    const results = calculateResults();
    
    // Save to history
    pollHistory.push({
      question: currentPoll.question,
      options: currentPoll.options,
      results,
      createdAt: currentPoll.createdAt,
      endedAt: new Date()
    });
    
    console.log('Poll ended:', currentPoll.question);
    
    // Send results to everyone
    io.emit('poll-ended', {
      results,
      question: currentPoll.question
    });
    
    // Update teacher state
    if (teacher) {
      io.to('teacher').emit('poll-state', {
        currentPoll: null,
        students: Array.from(students.values()).map(s => ({ name: s.name, answered: s.answered })),
        results,
        canCreatePoll: true
      });
    }
    
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  // Teacher ends poll manually
  socket.on('end-poll', () => {
    if (socket.id !== teacher) {
      socket.emit('error', 'Only teacher can end polls');
      return;
    }
    endPoll();
  });

  // Get poll history (bonus feature)
  socket.on('get-poll-history', () => {
    if (socket.id !== teacher) {
      socket.emit('error', 'Only teacher can view history');
      return;
    }
    socket.emit('poll-history', pollHistory);
  });

  // Remove student
  socket.on('remove-student', (studentId) => {
    if (socket.id !== teacher) {
      socket.emit('error', 'Only teacher can remove students');
      return;
    }    
    const student = students.get(studentId);
    if (student) {
      io.to(student.socketId).emit('removed', { message: 'You have been removed by the teacher' });
      students.delete(studentId);
      io.to('teacher').emit('student-left', {
        name: student.name,
        totalStudents: students.size
      });
    }
  });

  // Chat functionality
  socket.on('send-message', (data) => {
    const { message, isPrivate, targetStudentId } = data;
    let senderName = 'Unknown';
    let senderType = 'unknown';
    
    // Determine sender
    if (socket.id === teacher) {
      senderName = 'Teacher';
      senderType = 'teacher';
    } else {
      // Find student
      for (let [studentId, student] of students.entries()) {
        if (student.socketId === socket.id) {
          senderName = student.name;
          senderType = 'student';
          break;
        }
      }
    }
    
    const messageData = {
      message,
      senderName,
      senderType,
      timestamp: new Date().toISOString(),
      isPrivate: isPrivate || false
    };
    
    if (isPrivate && targetStudentId) {
      // Private message from teacher to specific student
      if (senderType === 'teacher') {
        const targetStudent = students.get(targetStudentId);
        if (targetStudent) {
          io.to(targetStudent.socketId).emit('new-message', messageData);
          socket.emit('new-message', messageData); // Send back to teacher
        }
      }
    } else {
      // Broadcast to all (teacher and students)
      io.emit('new-message', messageData);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove teacher
    if (socket.id === teacher) {
      teacher = null;
      console.log('Teacher disconnected');
    }
    
    // Remove student
    for (let [studentId, student] of students.entries()) {
      if (student.socketId === socket.id) {
        students.delete(studentId);
        console.log('Student disconnected:', student.name);
        
        // Notify teacher
        if (teacher) {
          io.to('teacher').emit('student-left', {
            name: student.name,
            totalStudents: students.size
          });
        }
        break;
      }
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Live Polling System Backend',
    activePolls: currentPoll ? 1 : 0,
    connectedStudents: students.size,
    teacherConnected: !!teacher
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

