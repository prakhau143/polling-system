#!/bin/bash

# 🚀 Live Polling System - Quick Deployment Script
# This script helps you deploy your app quickly

echo "🎯 Live Polling System - Deployment Helper"
echo "=========================================="

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed."
    echo "📥 Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    echo "🍺 Or on macOS: brew tap heroku/brew && brew install heroku"
    exit 1
fi

echo "✅ Heroku CLI found!"

# Login to Heroku
echo "🔑 Please login to Heroku..."
heroku login

# Create Heroku app
read -p "🏷️  Enter your Heroku app name (e.g., my-polling-backend): " app_name

if [ -z "$app_name" ]; then
    echo "❌ App name cannot be empty!"
    exit 1
fi

echo "🚀 Creating Heroku app: $app_name"
heroku create $app_name

# Set environment variables
echo "⚙️  Setting up environment variables..."
heroku config:set NODE_ENV=production --app $app_name

# Deploy backend
echo "📦 Deploying backend to Heroku..."
git subtree push --prefix=backend heroku main

# Get the app URL
app_url="https://${app_name}.herokuapp.com"
echo "🌐 Backend deployed to: $app_url"

# Update frontend environment variable
echo "🔧 Updating frontend configuration..."
echo "REACT_APP_SERVER_URL=${app_url}" > frontend/.env.production

# Commit the changes
git add frontend/.env.production
git commit -m "Update production API URL for deployment: $app_url"
git push origin main

echo ""
echo "🎉 Backend Deployment Complete!"
echo "================================"
echo "🌐 Backend URL: $app_url"
echo "🧪 Test it: curl $app_url"
echo ""
echo "📱 Next Steps for Frontend:"
echo "1. Go to https://netlify.com and sign in"
echo "2. Click 'New site from Git'"
echo "3. Choose GitHub and select 'polling-system' repository"
echo "4. Configure build settings:"
echo "   - Base directory: frontend"
echo "   - Build command: npm run build"
echo "   - Publish directory: frontend/build"
echo "5. Add environment variable:"
echo "   - Key: REACT_APP_SERVER_URL"
echo "   - Value: $app_url"
echo "6. Click 'Deploy site'"
echo ""
echo "🚀 Your Live Polling System will be ready!"
echo "📚 Full deployment guide: ./DEPLOYMENT.md"
