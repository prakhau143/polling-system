import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserType, setStudentInfo, setError, clearError } from '../store/pollSlice';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import socketService from '../services/socket';

const MainApp = () => {
  const dispatch = useDispatch();
  const { userType, error, studentName, studentId } = useSelector((state) => state.poll);
  const [name, setName] = useState('');
  const [tempStudentId, setTempStudentId] = useState('');
  
  const handleRoleSelection = (role) => {
    dispatch(setUserType(role));
    if (role === 'teacher') {
      socketService.joinAsTeacher();
    }
  };

  const handleNameSubmit = () => {
    if (name.trim() === '' || tempStudentId.trim() === '') {
      dispatch(setError('Name and unique ID are required.'));
      return;
    }

    dispatch(clearError());
    dispatch(setStudentInfo({ name: name.trim(), studentId: tempStudentId.trim() }));
  };

  const handleBackToRoleSelection = () => {
    dispatch(setUserType(null));
    setName('');
    setTempStudentId('');
    dispatch(clearError());
  };

  if (userType === 'teacher') {
    return <TeacherDashboard />;
  }

  if (userType === 'student' && studentName && studentId) {
    return <StudentDashboard />;
  }

  return (
    <div className="App">
      <div className="main-container">
        {!userType && (
          <div className="role-selection">
            <div className="card">
              <h1>Welcome to the Live Polling System</h1>
              <p>Select what type of user you are</p>
              
              <div className="role-buttons">
                <div className="role-card" onClick={() => handleRoleSelection('student')}>
                  <div className="role-icon">👨‍🎓</div>
                  <div className="role-title">I am Student</div>
                  <div className="role-desc">Join and participate in polls</div>
                </div>
                
                <div className="role-card" onClick={() => handleRoleSelection('teacher')}>
                  <div className="role-icon">👨‍🏫</div>
                  <div className="role-title">I am Teacher</div>
                  <div className="role-desc">Create and manage polls</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {userType === 'student' && !studentId && (
          <div className="student-form">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button 
                  className="btn btn-secondary btn-small" 
                  onClick={handleBackToRoleSelection}
                  style={{ marginRight: '16px' }}
                >
                  ← Back
                </button>
                <h1 style={{ margin: 0, textAlign: 'left' }}>Student Details</h1>
              </div>
              
              <p>Please enter your details to join the polling session</p>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter unique ID"
                    value={tempStudentId}
                    onChange={(e) => setTempStudentId(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={handleNameSubmit}
                disabled={!name.trim() || !tempStudentId.trim()}
                style={{ width: '100%' }}
              >
                Join Session
              </button>
              
              {error && <div className="error">{error}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainApp;

