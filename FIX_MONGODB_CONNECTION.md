# 🔧 Fix MongoDB Atlas Connection Error

## ❌ Current Error
```
Could not connect to any servers in your MongoDB Atlas cluster
```

This error occurs because **your IP address is not whitelisted** in MongoDB Atlas.

## ✅ Solution - Whitelist Your IP Address

### Option 1: Allow Access from Anywhere (Recommended for Development)

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Login** with your credentials
3. **Select your Project** (the one containing your cluster)
4. Click **"Network Access"** in the left sidebar (under SECURITY section)
5. Click **"Add IP Address"** button
6. Select **"ALLOW ACCESS FROM ANYWHERE"**
   - This will add `0.0.0.0/0` to the whitelist
7. Click **"Confirm"**
8. Wait 1-2 minutes for changes to propagate

### Option 2: Add Your Current IP Only (More Secure)

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Login** with your credentials
3. **Select your Project**
4. Click **"Network Access"** in the left sidebar
5. Click **"Add IP Address"** button
6. Click **"Add Current IP Address"**
   - It will auto-detect your IP
7. Click **"Confirm"**
8. Wait 1-2 minutes for changes to propagate

## 🔄 After Whitelisting Your IP

1. **Run the setup script again**:
   ```bash
   npm run setup
   ```

2. **You should see**:
   ```
   ✅ Connected to MongoDB
   ✅ Default admin created successfully!
   📧 Email: admin@dlcourse.com
   🔑 Password: admin123
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

4. **Login to admin panel**:
   - URL: http://localhost:3000/admin/login
   - Email: admin@dlcourse.com
   - Password: admin123

## 🆘 Alternative: Use Local MongoDB (If Atlas Doesn't Work)

If MongoDB Atlas continues to have issues, you can use local MongoDB:

### Step 1: Install MongoDB Locally
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings

### Step 2: Update .env File
Change the connection string to:
```
MONGODB_URI=mongodb://localhost:27017/dl-course-platform
```

### Step 3: Run Setup & Start
```bash
npm run setup
npm run dev
```

## 🔍 Verify Connection

Test if MongoDB is accessible:
```bash
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dlcourse:lCxZUuFhBOrIycQb@cluster0.u6dyo4p.mongodb.net/dl-course-platform').then(() => console.log('✅ Connected!')).catch(err => console.error('❌ Failed:', err.message));"
```

## 📝 MongoDB Atlas Credentials

**Cluster URI**: 
```
mongodb+srv://dlcourse:lCxZUuFhBOrIycQb@cluster0.u6dyo4p.mongodb.net/dl-course-platform
```

**Admin Login** (after setup):
- Email: admin@dlcourse.com
- Password: admin123

## ⚠️ Common Issues

### Issue 1: "Cluster is paused"
- Go to MongoDB Atlas Dashboard
- Click on your cluster
- If paused, click "Resume" button

### Issue 2: "Authentication failed"
- Check if username/password in connection string is correct
- The current connection uses username: `dlcourse` and password: `lCxZUuFhBOrIycQb`

### Issue 3: "Database doesn't exist"
- MongoDB will automatically create the database on first connection
- No action needed

## 🎯 Quick Fix Checklist

- [ ] Whitelist IP address in MongoDB Atlas Network Access
- [ ] Wait 1-2 minutes after whitelisting
- [ ] Run `npm run setup`
- [ ] Verify admin user is created
- [ ] Run `npm run dev`
- [ ] Login at http://localhost:3000/admin/login

---

**Need Help?** Check MongoDB Atlas docs: https://www.mongodb.com/docs/atlas/security-whitelist/
