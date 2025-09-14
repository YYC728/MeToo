# Railway Deployment Troubleshooting Guide

## Common Railway Deployment Issues & Solutions

### 1. Missing Dependencies
**Problem**: Build fails with "Cannot find module" errors
**Solution**: ✅ FIXED - Added missing dependencies to package.json:
- `express-validator`: ^7.0.1
- `multer`: ^1.4.5-lts.1  
- `firebase-admin`: ^11.11.1
- `@types/multer`: ^1.4.11

### 2. Build Configuration Issues
**Problem**: TypeScript compilation fails
**Solution**: ✅ VERIFIED - tsconfig.json is properly configured:
- Target: ES2020
- Module: commonjs
- Output directory: ./dist
- Source directory: ./src

### 3. Start Command Issues
**Problem**: Application fails to start
**Solution**: ✅ VERIFIED - Start command is correct:
- `npm run start` → `node dist/server.js`
- Build command: `npm run build` → `tsc`

### 4. Environment Variables
**Problem**: Application crashes due to missing environment variables
**Solution**: Set these in Railway dashboard:
```
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/metoo-app
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

### 5. Health Check Issues
**Problem**: Health check fails
**Solution**: ✅ FIXED - Updated healthcheck timeout to 300 seconds
- Health check path: `/health`
- Timeout: 300 seconds

### 6. Database Connection Issues
**Problem**: Cannot connect to MongoDB
**Solution**: 
- Ensure MONGO_URI is set correctly
- Use MongoDB Atlas for production
- Check network access in MongoDB Atlas

### 7. File Upload Issues
**Problem**: Multer uploads fail
**Solution**: 
- Ensure uploads directory exists
- Check file size limits
- Verify MIME type restrictions

## Deployment Steps

1. **Push updated code to GitHub**:
   ```bash
   git add .
   git commit -m "Fix Railway deployment - add missing dependencies"
   git push origin main
   ```

2. **Set Environment Variables in Railway**:
   - Go to your Railway project dashboard
   - Navigate to Variables tab
   - Add all required environment variables

3. **Redeploy**:
   - Railway will automatically redeploy when you push to GitHub
   - Monitor the build logs for any errors

## Build Process Verification

The build process should work as follows:
1. **Install**: `npm ci` (installs all dependencies)
2. **Build**: `npm run build` (compiles TypeScript to JavaScript)
3. **Start**: `npm run start` (runs the compiled application)

## Common Error Messages & Solutions

### "Cannot find module 'express-validator'"
- **Cause**: Missing dependency
- **Solution**: ✅ Fixed - Added to package.json

### "Cannot find module 'multer'"
- **Cause**: Missing dependency  
- **Solution**: ✅ Fixed - Added to package.json

### "TypeError: Cannot read property 'x' of undefined"
- **Cause**: Missing environment variables
- **Solution**: Set all required environment variables in Railway

### "MongoError: Authentication failed"
- **Cause**: Invalid MongoDB connection string
- **Solution**: Verify MONGO_URI in Railway environment variables

### "EADDRINUSE: address already in use"
- **Cause**: Port conflict
- **Solution**: Railway handles this automatically with PORT environment variable

## Testing Locally Before Deployment

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Test the build**:
   ```bash
   npm run start
   ```

4. **Verify health check**:
   ```bash
   curl http://localhost:3000/health
   ```

## Next Steps After Fix

1. Commit and push the updated package.json
2. Check Railway build logs
3. Verify environment variables are set
4. Test the deployed application
5. Monitor application logs for any runtime errors

## Support

If deployment still fails after these fixes:
1. Check Railway build logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas allows connections from Railway's IP ranges
4. Check that all file paths are correct (case-sensitive on Linux)
