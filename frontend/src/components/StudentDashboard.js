import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '../services/socket';
import { decrementTime, setUserType } from '../store/pollSlice';
import ChatPopup from './ChatPopup';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { 
    studentName, 
    studentId, 
    currentPoll, 
    results, 
    hasAnswered, 
    timeRemaining,
    error 
  } = useSelector((state) => state.poll);
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [submittedPaper, setSubmittedPaper] = useState(false);

  // Sample Java coding questions for when no poll is active
  const sampleQuestions = [
    {
      question: "What is the correct way to declare a variable in Java?",
      options: [
        "int x = 10;",
        "variable x = 10;",
        "x = 10;",
        "declare int x = 10;"
      ],
      correctAnswer: 0
    },
    {
      question: "Which of the following is NOT a primitive data type in Java?",
      options: [
        "int",
        "boolean",
        "String",
        "char"
      ],
      correctAnswer: 2
    },
    {
      question: "What is the output of: System.out.println(5 + 3 + \"Java\");",
      options: [
        "8Java",
        "5 + 3Java",
        "53Java",
        "Java8"
      ],
      correctAnswer: 0
    }
  ];

  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [sampleSelectedOption, setSampleSelectedOption] = useState(null);
  const [showSampleResult, setShowSampleResult] = useState(false);

  useEffect(() => {
    if (studentName && studentId) {
      socketService.joinAsStudent(studentName, studentId);
    }
  }, [studentName, studentId]);

  useEffect(() => {
    let timer;
    if (currentPoll && !hasAnswered && timeRemaining > 0) {
      timer = setInterval(() => {
        dispatch(decrementTime());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentPoll, hasAnswered, timeRemaining, dispatch]);

  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;
    socketService.submitAnswer(studentId, selectedOption);
    setSelectedOption(null);
    setShowResults(true);
  };

  const handleSampleAnswerSubmit = () => {
    if (sampleSelectedOption === null) return;
    setShowSampleResult(true);
  };

  const handleNextSampleQuestion = () => {
    if (currentSampleIndex < sampleQuestions.length - 1) {
      setCurrentSampleIndex(currentSampleIndex + 1);
      setSampleSelectedOption(null);
      setShowSampleResult(false);
    }
  };

  const handleExit = () => {
    dispatch(setUserType(null));
  };

  const handleSubmitPaper = () => {
    if (window.confirm('Are you sure you want to submit your paper? You will not be able to rejoin with the same name and ID.')) {
      socketService.submitPaper(studentId);
      setSubmittedPaper(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePercentage = (count, total) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const getTotalVotes = (results) => {
    return results.reduce((sum, result) => sum + result.count, 0);
  };

  return (
    <div className="App">
      {/* Navigation Header */}
      <div className="nav-header">
        <div className="nav-title">Student Portal</div>
        <div className="nav-actions">
          <span style={{ marginRight: '16px', color: 'var(--medium-gray)' }}>Welcome, {studentName}</span>
          <button className="btn btn-secondary btn-small" onClick={handleExit}>
            Exit
          </button>
        </div>
      </div>

      <div className="main-container">
        {/* Live Poll Section */}
        {currentPoll && !hasAnswered && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Live Poll</h2>
              {timeRemaining > 0 && (
                <div className="timer">
                  <span className="timer-icon">⏱️</span>
                  <span>Time Remaining: {formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            
            <h3 style={{ marginBottom: '24px', color: 'var(--dark-gray)' }}>{currentPoll.question}</h3>
            
            <div className="poll-options">
              {currentPoll.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`option-item ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => setSelectedOption(index)}
                >
                  <input
                    type="radio"
                    className="option-radio"
                    id={`option-${index}`}
                    name="poll-option"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                  />
                  <span className="option-text">{option}</span>
                </div>
              ))}
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={handleAnswerSubmit} 
              disabled={selectedOption === null}
              style={{ width: '100%', marginTop: '20px' }}
            >
              Submit Answer
            </button>
          </div>
        )}

        {/* Poll Results */}
        {(hasAnswered || showResults) && results && results.length > 0 && (
          <div className="card">
            <h2>Poll Results</h2>
            <div className="results-container">
              {results.map((result, index) => {
                const totalVotes = getTotalVotes(results);
                const percentage = calculatePercentage(result.count, totalVotes);
                
                return (
                  <div key={index} className="result-item">
                    <div className="result-header">
                      <span className="result-label">{result.option}</span>
                      <span className="result-percentage">{percentage}% ({result.count} votes)</span>
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
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--medium-gray)' }}>
              Total Responses: {getTotalVotes(results)}
            </div>
          </div>
        )}

        {/* Sample Java Questions when no active poll */}
        {!currentPoll && !hasAnswered && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Practice Questions</h2>
              <span style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>
                Question {currentSampleIndex + 1} of {sampleQuestions.length}
              </span>
            </div>
            
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(119, 101, 218, 0.1)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--primary-purple)', fontWeight: '500' }}>☕ Java Programming</span>
            </div>
            
            <h3 style={{ marginBottom: '24px', color: 'var(--dark-gray)' }}>
              {sampleQuestions[currentSampleIndex].question}
            </h3>
            
            {!showSampleResult ? (
              <>
                <div className="poll-options">
                  {sampleQuestions[currentSampleIndex].options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`option-item ${sampleSelectedOption === index ? 'selected' : ''}`}
                      onClick={() => setSampleSelectedOption(index)}
                    >
                      <input
                        type="radio"
                        className="option-radio"
                        id={`sample-option-${index}`}
                        name="sample-poll-option"
                        value={index}
                        checked={sampleSelectedOption === index}
                        onChange={() => setSampleSelectedOption(index)}
                      />
                      <span className="option-text">{option}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="btn btn-primary"
                  onClick={handleSampleAnswerSubmit} 
                  disabled={sampleSelectedOption === null}
                  style={{ width: '100%', marginTop: '20px' }}
                >
                  Submit Answer
                </button>
              </>
            ) : (
              <>
                <div className="results-container">
                  {sampleQuestions[currentSampleIndex].options.map((option, index) => {
                    const isCorrect = index === sampleQuestions[currentSampleIndex].correctAnswer;
                    const isSelected = index === sampleSelectedOption;
                    
                    return (
                      <div key={index} className="result-item">
                        <div className="result-header">
                          <span className="result-label">
                            {option}
                            {isCorrect && <span style={{ color: '#22C55E', marginLeft: '8px' }}>✓ Correct</span>}
                            {isSelected && !isCorrect && <span style={{ color: '#FF4757', marginLeft: '8px' }}>✗ Your Answer</span>}
                          </span>
                        </div>
                        <div className="result-bar">
                          <div 
                            className="result-fill" 
                            style={{ 
                              width: isCorrect ? '100%' : (isSelected ? '60%' : '20%'),
                              background: isCorrect ? '#22C55E' : (isSelected ? '#FF4757' : 'var(--medium-gray)')
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  {sampleSelectedOption === sampleQuestions[currentSampleIndex].correctAnswer ? 
                    <div style={{ color: '#22C55E', fontWeight: '500' }}>🎉 Correct! Well done!</div> :
                    <div style={{ color: '#FF4757', fontWeight: '500' }}>❌ Incorrect. The correct answer is highlighted above.</div>
                  }
                </div>
                
                {currentSampleIndex < sampleQuestions.length - 1 && (
                  <button 
                    className="btn btn-primary"
                    onClick={handleNextSampleQuestion}
                    style={{ width: '100%', marginTop: '20px' }}
                  >
                    Next Question
                  </button>
                )}
                
                {currentSampleIndex === sampleQuestions.length - 1 && (
                  <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--medium-gray)' }}>
                    🎓 You've completed all practice questions! Wait for the teacher to start a new poll.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Waiting State */}
        {!currentPoll && hasAnswered && (!results || results.length === 0) && (
          <div className="card">
            <div className="loading">
              <div className="spinner"></div>
              <h3>Waiting for next question...</h3>
              <p>The teacher will ask a new question soon.</p>
            </div>
          </div>
        )}

        {error && <div className="error">{error}</div>}
      </div>
      
      {/* Submit Paper Footer - Only show if student has answered at least one question */}
      {hasAnswered && !submittedPaper && (
        <div className="footer-submit">
          <div style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>
            Ready to submit your answers?
          </div>
          <button 
            className="btn btn-success"
            onClick={handleSubmitPaper}
            style={{
              padding: '12px 24px',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            📋 Submit Your Paper
          </button>
        </div>
      )}
      
      <ChatPopup />
    </div>
  );
};

export default StudentDashboard;
