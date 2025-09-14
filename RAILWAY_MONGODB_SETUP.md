# Railway MongoDB Setup Guide

## 🎉 Your App is Successfully Deployed!

The build worked perfectly! Now you just need to set up the database connection.

## 🔧 **Current Issue**
- ✅ **Build**: SUCCESS
- ✅ **Deployment**: SUCCESS  
- ❌ **Database**: Missing MongoDB connection
- ❌ **Environment Variables**: Not configured

## 🚀 **Step-by-Step Fix**

### **Step 1: Create MongoDB Atlas Database**

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Sign up/Login** (free tier available)
3. **Create a new cluster**:
   - Choose "M0 Sandbox" (free tier)
   - Select a region close to you
   - Name it "metoo-cluster"
4. **Create database user**:
   - Go to "Database Access" → "Add New Database User"
   - Username: `metoo-app-user`
   - Password: `YourSecurePassword123!`
   - Database User Privileges: "Read and write to any database"
5. **Whitelist IP addresses**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
6. **Get connection string**:
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### **Step 2: Configure Railway Environment Variables**

1. **Go to your Railway project dashboard**
2. **Click on your deployed service**
3. **Go to "Variables" tab**
4. **Add these variables**:

```
MONGO_URI=mongodb+srv://metoo-app-user:YourSecurePassword123!@metoo-cluster.xxxxx.mongodb.net/metoo-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random-123456789
NODE_ENV=production
PORT=3000
```

**Replace**:
- `YourSecurePassword123!` with your actual password
- `xxxxx` with your actual cluster ID
- `your-super-secret-jwt-key-here-make-it-very-long-and-random-123456789` with a long random string

### **Step 3: Test the Connection**

After setting the variables, Railway will automatically redeploy. Then:

1. **Check Railway logs** - should show "MongoDB connected successfully"
2. **Test your app URL** - should work without database errors
3. **Test health endpoint** - `https://your-app.railway.app/health`

## 🔍 **Expected Result**

After setup, your Railway logs should show:
```
Server is running on port 3000
Socket.IO server initialized
MongoDB connected successfully
```

## 🆘 **If You Need Help**

1. **MongoDB Atlas Issues**: Check the [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/)
2. **Railway Issues**: Check the [Railway documentation](https://docs.railway.app/)
3. **Connection String Format**: Make sure it includes the database name at the end

## 🎯 **Quick Test**

Once everything is set up, test these endpoints:
- `GET /health` - Should return `{"status":"ok"}`
- `POST /api/auth/register` - Should work for user registration
- `POST /api/auth/login` - Should work for user login

Your app is **99% ready** - just needs the database connection! 🚀
