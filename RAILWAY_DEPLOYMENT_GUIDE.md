# 🚀 **RAILWAY DEPLOYMENT GUIDE**
## **MeToo University App - Quick Deploy to Railway**

---

## 📋 **STEP 1: PREPARE YOUR CODE**

### **1.1 Ensure All Files Are Ready**
Your project should have these Railway-specific files:
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Process file for Railway
- ✅ `nixpacks.toml` - Build configuration
- ✅ `package.json` - With correct start script
- ✅ `.env.example` - Environment variables template

### **1.2 Push to GitHub First**
1. Use GitHub Desktop to commit and push all changes
2. Make sure your repository is public or connected to Railway

---

## 📋 **STEP 2: DEPLOY TO RAILWAY**

### **2.1 Create Railway Account**
1. Go to: https://railway.app
2. Click **"Login"** and sign up with GitHub
3. Authorize Railway to access your GitHub repositories

### **2.2 Deploy from GitHub**
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `MeToo-University-App` repository
4. Click **"Deploy Now"**

### **2.3 Configure Environment Variables**
In Railway dashboard, go to your project → **Variables** tab and add:

```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/metoo-app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
NODE_ENV=production
PORT=3000
BASE_URL=https://your-app-name.railway.app

# Email (Optional - for email verification)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=your-s3-bucket-name
AWS_REGION=us-east-1

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Firebase (Optional - for push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### **2.4 Set Up Database**
Railway will automatically detect your MongoDB connection. You can:
1. **Use Railway's MongoDB**: Add Railway's MongoDB service
2. **Use MongoDB Atlas**: Use the MONGO_URI you set above
3. **Use External MongoDB**: Any MongoDB instance

---

## 📋 **STEP 3: CONFIGURE SERVICES**

### **3.1 Add MongoDB Service (Optional)**
1. In Railway project, click **"+ New"**
2. Select **"Database"** → **"MongoDB"**
3. Railway will create a MongoDB instance
4. Copy the connection string to your MONGO_URI variable

### **3.2 Add Redis Service (Optional)**
1. Click **"+ New"**
2. Select **"Database"** → **"Redis"**
3. Railway will create a Redis instance
4. Copy the connection string to your REDIS_URL variable

---

## 📋 **STEP 4: DEPLOY FRONTEND**

### **4.1 Deploy Frontend Separately**
1. Create a new Railway project
2. Connect to your GitHub repo
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm run build`
5. Set **Start Command** to `npx serve -s build -l 3000`

### **4.2 Frontend Environment Variables**
```bash
REACT_APP_API_URL=https://your-backend-app.railway.app
REACT_APP_SOCKET_URL=https://your-backend-app.railway.app
```

---

## 📋 **STEP 5: TEST DEPLOYMENT**

### **5.1 Test Backend API**
```bash
# Health check
curl https://your-backend-app.railway.app/health

# Test endpoints
curl https://your-backend-app.railway.app/api/auth/register
```

### **5.2 Test Frontend**
1. Open your frontend URL in browser
2. Test registration and login
3. Test meal browsing
4. Test story sharing

---

## 📋 **STEP 6: CONFIGURE CUSTOM DOMAIN (Optional)**

### **6.1 Add Custom Domain**
1. In Railway project, go to **Settings**
2. Click **"Domains"**
3. Add your custom domain
4. Update DNS records as instructed

### **6.2 Update Environment Variables**
```bash
BASE_URL=https://your-custom-domain.com
REACT_APP_API_URL=https://your-custom-domain.com
```

---

## 🎯 **RAILWAY DEPLOYMENT FEATURES**

### **✅ Automatic Deployments**
- Deploys automatically on every push to main branch
- Zero-downtime deployments
- Automatic rollback on failure

### **✅ Built-in Monitoring**
- Real-time logs
- Performance metrics
- Error tracking
- Health checks

### **✅ Easy Scaling**
- Scale up/down with one click
- Automatic resource management
- Pay only for what you use

### **✅ Database Integration**
- Built-in MongoDB and Redis
- Automatic connection strings
- Database backups

---

## 🚀 **EXPECTED RESULTS**

After deployment, you'll have:

### **✅ Live Backend API**
- URL: `https://your-app-name.railway.app`
- All 16 API endpoints working
- Real-time Socket.IO messaging
- JWT authentication
- File upload capabilities

### **✅ Live Frontend**
- URL: `https://your-frontend-app.railway.app`
- React application with Material-UI
- Connected to backend API
- Real-time features working

### **✅ Production Features**
- HTTPS enabled
- Automatic SSL certificates
- Global CDN
- 99.9% uptime
- Auto-scaling

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues & Solutions**

**1. Build Fails**
```bash
# Check build logs in Railway dashboard
# Ensure all dependencies are in package.json
# Check TypeScript compilation
```

**2. Environment Variables Not Working**
```bash
# Verify all variables are set in Railway dashboard
# Check variable names match exactly
# Restart the service after adding variables
```

**3. Database Connection Issues**
```bash
# Check MONGO_URI format
# Ensure database is accessible
# Check network connectivity
```

**4. Frontend Can't Connect to Backend**
```bash
# Verify REACT_APP_API_URL is correct
# Check CORS settings in backend
# Ensure backend is running
```

---

## 📊 **MONITORING YOUR DEPLOYMENT**

### **Railway Dashboard Features**
- **Metrics**: CPU, memory, network usage
- **Logs**: Real-time application logs
- **Deployments**: Deployment history and status
- **Variables**: Environment variable management
- **Domains**: Custom domain configuration

### **Health Checks**
- Automatic health monitoring
- Uptime tracking
- Performance metrics
- Error rate monitoring

---

## 🎉 **SUCCESS!**

Your MeToo University App is now deployed to Railway with:

- ✅ **Live Backend API** - All endpoints working
- ✅ **Live Frontend** - React app accessible
- ✅ **Database** - MongoDB connected
- ✅ **Real-time Features** - Socket.IO working
- ✅ **Authentication** - JWT system active
- ✅ **File Uploads** - S3 integration ready
- ✅ **Monitoring** - Railway dashboard
- ✅ **Auto-deployment** - Updates on every push

**Ready for university students to use!** 🎓

---

## 📞 **NEXT STEPS**

1. **Test with Real Users** - Invite university students
2. **Monitor Performance** - Use Railway dashboard
3. **Add Mobile App** - Deploy React Native app
4. **Scale as Needed** - Railway auto-scales
5. **Add Custom Domain** - Professional URL

**Your MeToo University App is now live and ready for the world!** 🚀

