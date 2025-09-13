# 🚀 **QUICK RAILWAY DEPLOYMENT**

## **Step-by-Step Instructions**

### **1. Push to GitHub First**
```bash
# Use GitHub Desktop to commit and push all changes
# Make sure your repository is public or connected to Railway
```

### **2. Deploy to Railway**
1. Go to: https://railway.app
2. Click **"Login"** and sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `MeToo-University-App` repository
5. Click **"Deploy Now"**

### **3. Set Environment Variables**
In Railway dashboard → **Variables** tab, add:

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/metoo-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
PORT=3000
BASE_URL=https://your-app-name.railway.app
```

### **4. Add Database (Optional)**
1. In Railway project, click **"+ New"**
2. Select **"Database"** → **"MongoDB"**
3. Copy connection string to MONGO_URI variable

### **5. Test Your Deployment**
```bash
# Health check
curl https://your-app-name.railway.app/health

# Test API
curl https://your-app-name.railway.app/api/auth/register
```

## **🎉 SUCCESS!**
Your MeToo University App is now live on Railway!

**Backend URL**: `https://your-app-name.railway.app`
**API Endpoints**: `https://your-app-name.railway.app/api`

## **Next Steps**
1. Deploy frontend separately
2. Test with real users
3. Add custom domain
4. Monitor performance
