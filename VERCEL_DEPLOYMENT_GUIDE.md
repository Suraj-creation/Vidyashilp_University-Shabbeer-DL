# 🚀 DL Course Platform - Vercel Deployment Guide

> **Complete step-by-step guide to deploy your Deep Learning Course Platform to Vercel**

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [MongoDB Atlas Setup](#-mongodb-atlas-setup)
3. [GitHub Repository Setup](#-github-repository-setup)
4. [Vercel Deployment Steps](#-vercel-deployment-steps)
5. [Environment Variables Configuration](#-environment-variables-configuration)
6. [Post-Deployment Setup](#-post-deployment-setup)
7. [Troubleshooting](#-troubleshooting)
8. [Maintenance & Updates](#-maintenance--updates)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with your code pushed to a repository
- [ ] Vercel account (free tier works fine) - [Sign up here](https://vercel.com/signup)
- [ ] MongoDB Atlas account - [Sign up here](https://www.mongodb.com/atlas)
- [ ] Your code pushed to GitHub

**Your Repositories:**

- `https://github.com/Suraj-creation/Dr.-Shabbeer-Basha`

---

## 🍃 MongoDB Atlas Setup

### Step 1: Whitelist All IPs for Vercel

Vercel uses dynamic IP addresses, so you must allow access from anywhere:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your project/cluster
3. Navigate to **Network Access** (left sidebar)
4. Click **+ ADD IP ADDRESS**
5. Click **ALLOW ACCESS FROM ANYWHERE**
6. This adds `0.0.0.0/0` to the whitelist
7. Click **Confirm**

⚠️ **Important:** Without this step, Vercel cannot connect to your database!

### Step 2: Verify Connection String

Your MongoDB connection string:
```
mongodb+srv://dlcourse:lCxZUuFhBOrIycQb@cluster0.u6dyo4p.mongodb.net/dl-course-platform?retryWrites=true&w=majority&appName=Cluster0
```

**Components:**
| Part | Value |
|------|-------|
| Username | `dlcourse` |
| Password | `lCxZUuFhBOrIycQb` |
| Cluster | `cluster0.u6dyo4p.mongodb.net` |
| Database | `dl-course-platform` |

---

## 📦 GitHub Repository Setup

Your code should already be pushed. Verify:

1. Go to your repository on GitHub
2. Ensure all files are present, including:
   - `/client` folder (React frontend)
   - `/server` folder (Express backend)
   - `vercel.json` (deployment configuration)
   - `package.json` (root)

---

## 🔧 Vercel Deployment Steps

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repository:
   - `Suraj-creation/DL_course-Shabbeer.Basha` or
   - `Suraj-creation/Dr.-Shabbeer-Basha`

### Step 2: Configure Project Settings

On the deployment configuration screen, set:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Other` |
| **Root Directory** | `./ ` (leave as root) |
| **Build Command** | Leave default (uses vercel.json) |
| **Output Directory** | Leave default (uses vercel.json) |
| **Install Command** | Leave default |

### Step 3: Add Environment Variables

**⚠️ CRITICAL: You MUST add these before deploying!**

Click **"Environment Variables"** section and add each variable:

---

## 🔐 Environment Variables Configuration

### Required Environment Variables for Vercel

Add these **EXACTLY** as shown in Vercel Dashboard → Settings → Environment Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://dlcourse:lCxZUuFhBOrIycQb@cluster0.u6dyo4p.mongodb.net/dl-course-platform?retryWrites=true&w=majority&appName=Cluster0` | Production, Preview, Development |
| `JWT_SECRET` | `f8d92a1b7c4e6d3f5a0b8c9e2d4f6a1c7e3b5d9f2a4c6e8b0d2f4a6c8e0b2d4f6` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `CLIENT_URL` | `https://your-app-name.vercel.app` | Production |
| `ADMIN_EMAIL` | `dr.shabbeer@vidyashilp.edu.in` | Production |
| `ADMIN_PASSWORD` | `DL@VU2026$ecure` | Production |

### How to Add Environment Variables:

1. Scroll down to **"Environment Variables"** section
2. Enter variable **Name** (e.g., `MONGODB_URI`)
3. Enter variable **Value** (copy exactly from table above)
4. Select environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **"Add"**
6. Repeat for all variables

### Copy-Paste Ready Values:

```env
# Copy these one by one into Vercel:

MONGODB_URI
mongodb+srv://dlcourse:lCxZUuFhBOrIycQb@cluster0.u6dyo4p.mongodb.net/dl-course-platform?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET
f8d92a1b7c4e6d3f5a0b8c9e2d4f6a1c7e3b5d9f2a4c6e8b0d2f4a6c8e0b2d4f6

NODE_ENV
production

ADMIN_EMAIL
dr.shabbeer@vidyashilp.edu.in

ADMIN_PASSWORD
DL@VU2026$ecure
```

### Step 4: Deploy

1. After adding all environment variables, click **"Deploy"**
2. Wait for the build to complete (usually 2-4 minutes)
3. Once deployed, Vercel will give you a URL like:
   - `https://dl-course-shabbeer-basha.vercel.app`
   - `https://dr-shabbeer-basha.vercel.app`

---

## 🔄 Post-Deployment Setup

### Step 1: Update CLIENT_URL

After getting your Vercel URL:

1. Go to Vercel Dashboard → Your Project → **Settings**
2. Navigate to **Environment Variables**
3. Find `CLIENT_URL`
4. Update value to your actual Vercel URL (e.g., `https://dl-course-shabbeer-basha.vercel.app`)
5. Click **Save**
6. Go to **Deployments** tab → Click **"..."** on latest → **"Redeploy"**

### Step 2: Verify Deployment

1. **Homepage:** Visit your Vercel URL - should show the landing page
2. **API Health:** Visit `https://your-app.vercel.app/api/health`
3. **Admin Login:** Visit `https://your-app.vercel.app/admin/login`

### Step 3: Test Admin Login

Use these credentials:
- **Email:** `dr.shabbeer@vidyashilp.edu.in`
- **Password:** `DL@VU2026$ecure`

---

## 🔍 Troubleshooting

### ❌ Error: "Module not found" or Build Failed

**Solution:** Check if all dependencies are in package.json:
```bash
# In project root
npm install

# In client folder
cd client && npm install
```

Then push changes to GitHub:
```bash
git add .
git commit -m "Fix dependencies"
git push
```

### ❌ Error: "MongoDB Connection Failed"

**Solutions:**
1. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
2. Check `MONGODB_URI` environment variable is correct
3. Ensure no typos in connection string

### ❌ Error: "401 Unauthorized" on Admin Login

**Solutions:**
1. Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in Vercel
2. Make sure `JWT_SECRET` is set
3. The admin account is created on first server startup

### ❌ Error: "CORS Error" or API Not Working

**Solutions:**
1. Update `CLIENT_URL` to your actual Vercel URL
2. Redeploy after changing environment variables

### ❌ Blank Page / React Not Loading

**Solutions:**
1. Check browser console for errors (F12)
2. Verify `vercel.json` routing is correct
3. Check that `/client/build` was created during build

### View Deployment Logs

1. Go to Vercel Dashboard → Your Project
2. Click on **Deployments**
3. Click on the deployment
4. Click **"Functions"** tab to see API logs
5. Click **"Build Logs"** to see build output

---

## 🔄 Maintenance & Updates

### Pushing Updates

After making changes locally:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel automatically redeploys when you push to GitHub!

### Changing Environment Variables

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Edit the variable value
3. Go to Deployments → Redeploy for changes to take effect

### Monitoring

- **Vercel Analytics:** Built-in analytics in Vercel dashboard
- **Function Logs:** Vercel Dashboard → Functions tab
- **MongoDB Metrics:** MongoDB Atlas → Metrics tab

---

## 📊 Your Deployment Checklist

Before deploying, verify:

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] All 6 environment variables added to Vercel:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV`
  - [ ] `CLIENT_URL`
  - [ ] `ADMIN_EMAIL`
  - [ ] `ADMIN_PASSWORD`

After deploying:

- [ ] Homepage loads correctly
- [ ] API health check passes (`/api/health`)
- [ ] Admin login works
- [ ] Updated `CLIENT_URL` with actual Vercel URL
- [ ] Redeployed after updating `CLIENT_URL`

---

## 🔗 Quick Reference

### Your URLs (after deployment)

| Resource | URL |
|----------|-----|
| Homepage | `https://your-app.vercel.app` |
| Admin Login | `https://your-app.vercel.app/admin/login` |
| API Health | `https://your-app.vercel.app/api/health` |
| Admin Dashboard | `https://your-app.vercel.app/admin/dashboard` |

### Admin Credentials

| Field | Value |
|-------|-------|
| Email | `dr.shabbeer@vidyashilp.edu.in` |
| Password | `DL@VU2026$ecure` |

### Important Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [MongoDB Atlas](https://cloud.mongodb.com/)
- [GitHub Repository](https://github.com/Suraj-creation/DL_course-Shabbeer.Basha)

---

## 📞 Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Review Vercel deployment logs
3. Verify MongoDB Atlas connection
4. Ensure all environment variables are correctly set

---

**Last Updated:** January 2026  
**Platform:** DL Course Platform for DATA302 - Deep Learning  
**Instructor:** Dr. Shabbeer Basha, Vidyashilp University
