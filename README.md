# 🎯 Live Polling System

A comprehensive real-time polling system built with React, Redux, Express.js, and Socket.io. Perfect for interactive classroom sessions, meetings, and live Q&A sessions.

## 🌟 Features

### ✅ Core Features
- **Two User Roles**: Teacher and Student interfaces
- **Real-time Polling**: Live question-answer sessions with instant results
- **Time-limited Questions**: Configurable time limits (10-300 seconds)
- **Smart Poll Management**: Teachers can only create new polls when appropriate
- **Live Results Dashboard**: Real-time response tracking and visualization
- **Student Management**: View connected students and their response status

### 🎁 Bonus Features
- **Chat System**: Real-time communication between teachers and students
- **Poll History**: Complete history of past polls with detailed results
- **Student Removal**: Teachers can remove disruptive students
- **Paper Submission**: Students can submit their answers and exit
- **Practice Questions**: Java programming questions for students when no active poll
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: React 19, Redux Toolkit, Socket.io Client
- **Backend**: Express.js, Socket.io, Node.js
- **Styling**: Custom CSS with CSS Variables
- **Real-time Communication**: WebSocket connections via Socket.io

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/prakhau143/polling-system.git
cd polling-system
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Start the Backend Server**
```bash
cd ../backend
npm start
```

5. **Start the Frontend Development Server**
```bash
cd ../frontend
npm start
```

6. **Open your browser**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📱 How to Use

### For Teachers:
1. Select "I am Teacher" on the welcome page
2. Create polls with multiple-choice questions
3. Set custom time limits for each question
4. Monitor live results and student participation
5. Use the chat feature to communicate with students
6. View poll history and manage connected students

### For Students:
1. Select "I am Student" and enter your name + unique ID
2. Wait for the teacher to start a poll
3. Answer questions within the time limit
4. View results after submitting your answer
5. Practice with sample Java questions when no poll is active
6. Submit your paper when ready to exit

## 🎨 Design Features

- **Purple Theme**: Professional color scheme matching modern UI trends
- **Intuitive Navigation**: Tab-based interface for easy switching between features
- **Real-time Updates**: Live counters, timers, and progress indicators
- **Visual Feedback**: Progress bars, status indicators, and animations
- **Responsive Layout**: Optimized for both desktop and mobile devices

## 🏗️ Architecture

```
polling-system/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API and Socket services
│   │   ├── store/          # Redux store and slices
│   │   └── App.css         # Styling
│   └── package.json
├── backend/                 # Express server
│   ├── server.js           # Main server file
│   ├── package.json
│   └── Procfile           # Heroku deployment
├── README.md
└── netlify.toml           # Netlify deployment
```

## 🚀 Deployment

### Backend (Heroku)
1. Create a Heroku app: `heroku create your-app-name`
2. Push to Heroku: `git push heroku main`
3. Your backend will be available at: `https://your-app-name.herokuapp.com`

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Update environment variable: `REACT_APP_SERVER_URL=https://your-backend-url.herokuapp.com`

## 🔧 Configuration

### Environment Variables

**Frontend (.env.production)**
```
REACT_APP_SERVER_URL=https://your-backend-url.herokuapp.com
```

**Backend**
```
PORT=3001 (default)
```

## 📊 API Endpoints

### REST API
- `GET /` - Server status and statistics

### WebSocket Events
- `join-as-teacher` - Teacher joins the session
- `join-as-student` - Student joins with name and ID
- `create-poll` - Teacher creates a new poll
- `submit-answer` - Student submits answer
- `end-poll` - Teacher ends current poll
- `remove-student` - Teacher removes student
- `submit-paper` - Student submits final answers
- `send-message` - Chat messaging
- `get-poll-history` - Request poll history

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Prakhar** - [GitHub Profile](https://github.com/prakhau143)

## 🙏 Acknowledgments

- Socket.io for real-time communication
- React team for the amazing framework
- Redux Toolkit for state management
- All contributors and testers

---

**🎉 Ready to transform your classroom or meeting experience with real-time polling!**

For questions or support, please open an issue on GitHub.
