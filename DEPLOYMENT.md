# Deploying Chat System to Render

## Prerequisites
1. A GitHub account
2. A Render account (sign up at https://render.com)
3. MongoDB Atlas account (for database) - https://www.mongodb.com/cloud/atlas

## Step 1: Prepare MongoDB Database

### Option A: MongoDB Atlas (Recommended)
1. Go to https://cloud.mongodb.com/
2. Create a new cluster (Free tier available)
3. Create a database user with username and password
4. Whitelist all IPs (0.0.0.0/0) for Render access
5. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/chat-system?retryWrites=true&w=majority`

## Step 2: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/Chat-System.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy on Render

### Method 1: Using Blueprint (Recommended)
1. Go to https://dashboard.render.com/
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file
5. Fill in the environment variables:
   - `PORT`: 7000 (or leave default 10000)
   - `DATABASE_URL`: Your MongoDB connection string
   - `JWT_KEY`: Generate a secure random string (e.g., use: `openssl rand -base64 32`)
   - `ORIGIN`: Your Render web service URL (will be provided, e.g., `https://chat-system.onrender.com`)

### Method 2: Manual Setup
1. Go to https://dashboard.render.com/
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: chat-system
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: main
   - **Root Directory**: (leave empty)
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   PORT=10000
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/chat-system
   JWT_KEY=your-secret-jwt-key-here
   ORIGIN=https://your-app-name.onrender.com
   ```

6. Click "Create Web Service"

## Step 4: Post-Deployment Setup

1. **Update ORIGIN variable**: After deployment, copy your Render URL and update the `ORIGIN` environment variable
2. **Create uploads directories**: Render's ephemeral file system means uploaded files will be lost on restart. Consider using a service like:
   - AWS S3
   - Cloudinary
   - Render Persistent Disks (paid plan)

## Step 5: Update Client Environment

If you need to update the client's server URL:

1. Create `client/.env` (for local development):
   ```
   VITE_SERVER_URL=http://localhost:7000
   ```

2. For production, the client will use the same domain since server serves the frontend.

## Important Notes

### Free Tier Limitations
- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-50 seconds
- Database connections may need reconnection logic

### File Uploads
The current setup stores files locally. For production:
1. Consider using Cloudinary, AWS S3, or similar services
2. Update file upload logic to use cloud storage
3. Or upgrade to Render plan with persistent storage

### WebSocket Considerations
- Socket.io should work out of the box on Render
- Ensure CORS is properly configured for your domain
- The `ORIGIN` environment variable must match your frontend URL

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`, not just `devDependencies`
- Ensure Node version is compatible (18-22)
- Check build logs for specific errors

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure database user has proper permissions

### Application Not Loading
- Check server logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure `PORT` environment variable is being used

### Socket.io Not Connecting
- Check CORS configuration
- Verify ORIGIN environment variable matches your domain
- Check browser console for WebSocket errors

## Monitoring

1. **Render Dashboard**: Monitor logs, metrics, and deployment status
2. **MongoDB Atlas**: Monitor database performance and connections
3. **Set up alerts**: Configure email notifications for deployment failures

## Updating Your Application

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically detect the push and redeploy your application.

## Custom Domain (Optional)

1. Go to your Web Service in Render Dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain and follow DNS configuration instructions
4. Update the `ORIGIN` environment variable to your custom domain
