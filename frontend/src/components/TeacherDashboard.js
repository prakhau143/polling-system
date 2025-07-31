import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '../services/socket';
import { setError, clearError, setUserType } from '../store/pollSlice';
import ChatPopup from './ChatPopup';
import PollHistory from './PollHistory';

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { currentPoll, canCreatePoll, students, results, pollHistory } = useSelector((state) => state.poll);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'results', 'students'
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [submittedStudents, setSubmittedStudents] = useState([]);

  useEffect(() => {
    // Request poll history when component mounts
    socketService.getPollHistory();
    
    // Listen for student submissions
    const handleStudentSubmission = (studentData) => {
      setSubmittedStudents(prev => [...prev, studentData]);
      console.log('Student submitted paper:', studentData);
    };
    
    if (socketService.socket) {
      socketService.socket.on('student-submitted-paper', handleStudentSubmission);
    }
    
    return () => {
      if (socketService.socket) {
        socketService.socket.off('student-submitted-paper', handleStudentSubmission);
      }
    };
  }, []);

  const handleCreatePoll = () => {
    if (!question || options.filter((opt) => opt.trim()).length < 2) {
      dispatch(setError('Please fill in the question and at least two options.'));
      return;
    }

    dispatch(clearError());
    socketService.createPoll({
      question,
      options: options.map((opt) => opt.trim()).filter(opt => opt),
      timeLimit: parseInt(timeLimit),
    });

    setQuestion('');
    setOptions(['', '']);
    setTimeLimit(60);
    setActiveTab('results');
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveStudent = (studentId) => {
    if (window.confirm('Are you sure you want to remove this student from the exam? They will be disconnected immediately.')) {
      socketService.removeStudent(studentId);
    }
  };

  const handleEndPoll = () => {
    socketService.endPoll();
    setActiveTab('create');
  };

  const handleExit = () => {
    dispatch(setUserType(null));
  };

  const calculatePercentage = (count, total) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const getTotalVotes = (results) => {
    return results ? results.reduce((sum, result) => sum + result.count, 0) : 0;
  };

  const getAnsweredCount = () => {
    return students.filter(s => s.answered).length;
  };

  return (
    <div className="App">
      {/* Navigation Header */}
      <div className="nav-header">
        <div className="nav-title">Teacher Dashboard</div>
        <div className="nav-actions">
          <button className="btn btn-secondary btn-small" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide History' : 'View History'}
          </button>
          <button className="btn btn-secondary btn-small" onClick={handleExit}>
            Exit
          </button>
        </div>
      </div>

      <div className="main-container">
        {/* Tab Navigation */}
        {!showHistory && (
          <div className="card">
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <button 
                className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('create')}
                style={{ borderRadius: '8px 8px 0 0', marginRight: '8px' }}
              >
                Create Poll
              </button>
              <button 
                className={`btn ${activeTab === 'results' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('results')}
                style={{ borderRadius: '8px 8px 0 0', marginRight: '8px' }}
              >
                Live Results
              </button>
              <button 
                className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('students')}
                style={{ borderRadius: '8px 8px 0 0' }}
              >
                Students ({students.length})
              </button>
            </div>

            {/* Create Poll Tab */}
            {activeTab === 'create' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Let's Get Started</h2>
                  {!canCreatePoll && (
                    <div style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>
                      ⏳ Wait for all students to answer current poll
                    </div>
                  )}
                </div>
                
                {canCreatePoll ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Question</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Enter your question here..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Options</label>
                      {options.map((opt, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ minWidth: '20px', color: 'var(--medium-gray)', fontSize: '14px' }}>
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <input
                            className="form-input"
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            style={{ margin: '0 0 0 8px', flex: 1 }}
                          />
                          {options.length > 2 && (
                            <button 
                              className="btn btn-danger btn-small" 
                              onClick={() => removeOption(index)}
                              style={{ marginLeft: '8px' }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {options.length < 6 && (
                        <button 
                          className="btn btn-secondary btn-small"
                          onClick={addOption}
                          style={{ marginTop: '8px' }}
                        >
                          + Add Option
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Time Limit (seconds)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          className="form-input"
                          type="number"
                          min="10"
                          max="300"
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(e.target.value)}
                          style={{ width: '100px' }}
                        />
                        <span style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>
                          {Math.floor(timeLimit / 60)}m {timeLimit % 60}s
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="btn btn-primary"
                      onClick={handleCreatePoll}
                      disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
                      style={{ width: '100%', marginTop: '20px' }}
                    >
                      🚀 Start Poll
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                    <h3>Poll in Progress</h3>
                    <p>Students are currently answering your poll. You can create a new poll once all students have responded.</p>
                  </div>
                )}
              </div>
            )}

            {/* Live Results Tab */}
            {activeTab === 'results' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Live Results</h2>
                  {currentPoll && (
                    <button className="btn btn-danger btn-small" onClick={handleEndPoll}>
                      End Poll
                    </button>
                  )}
                </div>
                
                {currentPoll ? (
                  <>
                    <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--light-gray)', borderRadius: '8px' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark-gray)' }}>{currentPoll.question}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--medium-gray)' }}>
                        <span>👥 {getAnsweredCount()}/{students.length} responses</span>
                        <span>⏱️ {timeLimit}s limit</span>
                      </div>
                    </div>
                    
                    {results && results.length > 0 ? (
                      <div className="results-container">
                        {results.map((result, index) => {
                          const totalVotes = getTotalVotes(results);
                          const percentage = calculatePercentage(result.count, totalVotes);
                          
                          return (
                            <div key={index} className="result-item">
                              <div className="result-header">
                                <span className="result-label">
                                  {String.fromCharCode(65 + index)}. {result.option}
                                </span>
                                <span className="result-percentage">{percentage}% ({result.count})</span>
                              </div>
                              <div className="result-bar">
                                <div 
                                  className="result-fill" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                        
                        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--medium-gray)' }}>
                          Total Responses: {getTotalVotes(results)}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <h3>Waiting for Responses</h3>
                        <p>Students are thinking... Results will appear as they submit their answers.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
                    <h3>No Active Poll</h3>
                    <p>Create a poll to see live results here.</p>
                  </div>
                )}
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Connected Students</h2>
                  <div style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>
                    {students.length} student{students.length !== 1 ? 's' : ''} online
                  </div>
                </div>
                
                {students.length > 0 ? (
                  <div className="students-list">
                    {students.map((student, idx) => (
                      <div key={student.studentId || idx} className="student-item">
                        <div className="student-info">
                          <div className="student-avatar">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="student-name">{student.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>ID: {student.studentId || (idx + 1)}</div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={`student-status ${student.answered ? 'status-answered' : 'status-waiting'}`}>
                            {student.answered ? '✓ Answered' : '⏳ Waiting'}
                          </span>
                          <button 
                            className="btn btn-danger btn-small"
                            onClick={() => handleRemoveStudent(student.studentId || student.name)}
                            title="Remove student from exam"
                          >
                            🚫 Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <h3>No Students Yet</h3>
                    <p>Students will appear here when they join your polling session.</p>
                  </div>
                )}
                
                {/* Submitted Students Section */}
                {submittedStudents.length > 0 && (
                  <div style={{ marginTop: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ color: '#22C55E' }}>📋 Submitted Papers</h3>
                      <div style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>
                        {submittedStudents.length} student{submittedStudents.length !== 1 ? 's' : ''} completed
                      </div>
                    </div>
                    
                    <div className="submitted-students-list" style={{ background: '#f8f9ff', padding: '16px', borderRadius: '8px' }}>
                      {submittedStudents.map((student, idx) => (
                        <div key={student.studentId || idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          background: 'white',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#22C55E',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '500', color: 'var(--dark-gray)' }}>{student.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>ID: {student.studentId}</div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {student.hasAnswered ? (
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>Answer:</div>
                                <div style={{ fontWeight: '500', color: '#22C55E' }}>{student.option || 'N/A'}</div>
                              </div>
                            ) : (
                              <div style={{ color: '#f59e0b', fontSize: '12px' }}>No answer submitted</div>
                            )}
                            <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>
                              Submitted: {new Date(student.submittedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Poll History */}
        {showHistory && (
          <div>
            <PollHistory history={pollHistory || []} />
          </div>
        )}
      </div>
      
      <ChatPopup />
    </div>
  );
};

export default TeacherDashboard;

