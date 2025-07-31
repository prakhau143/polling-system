import React from 'react';
import './PollHistory.css';

const PollHistory = ({ history }) => {
  return (
    <div className="poll-history">
      <div className="history-header">
        <h2>Poll History</h2>
        <p>View past poll results</p>
      </div>
      
      {history && history.length ? (
        <div className="history-list">
          {history.map((poll, index) => (
            <div key={index} className="poll-card">
              <div className="poll-header">
                <h3>{poll.question}</h3>
                <span className="poll-date">
                  {new Date(poll.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="poll-results">
                {poll.results.map((result, i) => {
                  const totalVotes = poll.results.reduce((sum, r) => sum + r.count, 0);
                  const percentage = totalVotes > 0 ? Math.round((result.count / totalVotes) * 100) : 0;
                  
                  return (
                    <div key={i} className="result-item">
                      <div className="result-info">
                        <span className="option-text">{result.option}</span>
                        <span className="vote-count">{result.count} votes ({percentage}%)</span>
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
              
              <div className="poll-stats">
                <span className="total-responses">
                  Total Responses: {poll.results.reduce((sum, r) => sum + r.count, 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-history">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No polls yet</h3>
            <p>Poll history will appear here once you create your first poll.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollHistory;
