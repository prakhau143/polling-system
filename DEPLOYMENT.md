# 🚀 Deployment Guide - Live Polling System

This guide will help you deploy your Live Polling System to the cloud for free using Heroku (backend) and Netlify (frontend).

## 📋 Prerequisites

- GitHub account (✅ Already done)
- Heroku account (free tier)
- Netlify account (free tier)
- Heroku CLI installed
- Git configured with your credentials

## 🔧 Step 1: Deploy Backend to Heroku

### 1.1 Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### 1.2 Login to Heroku
```bash
heroku login
```

### 1.3 Create Heroku App for Backend
```bash
cd /path/to/your/project
heroku create your-polling-backend
```

### 1.4 Set up Environment Variables
```bash
heroku config:set NODE_ENV=production
```

### 1.5 Deploy Backend
```bash
# Add Heroku remote (if not added automatically)
heroku git:remote -a your-polling-backend

# Create a subtree for backend deployment
git subtree push --prefix=backend heroku main
```

### 1.6 Verify Backend Deployment
Your backend will be available at: `https://your-polling-backend.herokuapp.com`

Test it: `curl https://your-polling-backend.herokuapp.com`

## 🌐 Step 2: Deploy Frontend to Netlify

### 2.1 Update Environment Variable
Before deploying, update the frontend to point to your Heroku backend:

```bash
# Update frontend/.env.production
echo "REACT_APP_SERVER_URL=https://your-polling-backend.herokuapp.com" > frontend/.env.production
```

### 2.2 Commit the Changes
```bash
git add frontend/.env.production
git commit -m "Update production API URL for deployment"
git push origin main
```

### 2.3 Deploy to Netlify

#### Option A: Netlify Drop (Quick & Easy)
1. Build the frontend locally:
```bash
cd frontend
npm run build
```
2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Drag and drop the `frontend/build` folder

#### Option B: GitHub Integration (Recommended)
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose GitHub and select your `polling-system` repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. Add environment variable:
   - **Key**: `REACT_APP_SERVER_URL`
   - **Value**: `https://your-polling-backend.herokuapp.com`
6. Click "Deploy site"

## 🔄 Step 3: Alternative Deployment Options

### Railway (Alternative to Heroku)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Vercel (Alternative to Netlify)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

## ✅ Step 4: Verify Deployment

### Test Your Live Application
1. **Frontend URL**: Your Netlify app URL (e.g., `https://amazing-app-123.netlify.app`)
2. **Backend URL**: Your Heroku app URL (e.g., `https://your-polling-backend.herokuapp.com`)

### Test Functionality
1. Open your frontend URL
2. Try creating a teacher session
3. Open another tab and join as a student
4. Test real-time polling
5. Test chat functionality

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
If you see CORS errors, ensure your backend allows your frontend domain:
```javascript
// In backend/server.js, update CORS settings
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-netlify-app.netlify.app"],
    methods: ["GET", "POST"]
  }
});
```

#### 2. Environment Variables Not Working
- Restart your Netlify deployment after adding environment variables
- Ensure the variable name starts with `REACT_APP_`

#### 3. Backend Not Starting on Heroku
Check logs: `heroku logs --tail -a your-polling-backend`

#### 4. Socket Connection Issues
Ensure your frontend points to the correct backend URL with HTTPS (not HTTP)

## 📊 Monitoring & Maintenance

### Heroku Monitoring
```bash
# View logs
heroku logs --tail -a your-polling-backend

# Check app status
heroku ps -a your-polling-backend

# Restart if needed
heroku restart -a your-polling-backend
```

### Netlify Monitoring
- Check deployment status in Netlify dashboard
- View build logs for any frontend issues

## 🚀 Going Live Checklist

- [ ] Backend deployed to Heroku and responding
- [ ] Frontend deployed to Netlify
- [ ] Environment variables set correctly
- [ ] CORS configured for production domains
- [ ] Real-time features working (Socket.io)
- [ ] Both teacher and student flows tested
- [ ] Chat functionality working
- [ ] Mobile responsiveness verified

## 🎉 Success!

Your Live Polling System is now live and ready to use! Share your application URLs:

- **App**: https://your-app.netlify.app
- **GitHub**: https://github.com/prakhau143/polling-system

### Sample Deployment URLs:
- Frontend: `https://live-polling-app.netlify.app`
- Backend: `https://live-polling-backend.herokuapp.com`

---

**Need help?** Create an issue in the GitHub repository or contact the development team.
