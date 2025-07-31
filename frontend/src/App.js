import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import socketService from './services/socket';
import MainApp from './components/MainApp';
import './App.css';

function App() {
  useEffect(() => {
    socketService.connect(store);
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <div className="App">
        <MainApp />
      </div>
    </Provider>
  );
}

export default App;
