# RescueLena - Deployment Guide

## 🚀 Deployment Options

### Option 1: Render (Recommended for Demo)

**Pros:**
- Free tier available
- Easy setup
- Auto-deploy from GitHub
- HTTPS included

**Cons:**
- Cold starts on free tier
- Limited resources
- May need paid tier for production

### Option 2: Vercel (Frontend) + Render (Backend)

**Pros:**
- Best performance
- Vercel excellent for React
- Separate scaling

**Cons:**
- Two deployments to manage
- CORS configuration needed

### Option 3: Railway

**Pros:**
- Easy deployment
- Good free tier
- Fast builds

**Cons:**
- Credit-based pricing
- May run out of credits

---

## 📦 Render Deployment (Step-by-Step)

### Prerequisites

1. GitHub account
2. Render account (free)
3. Push your code to GitHub

### Backend Deployment

**Step 1: Create Web Service**

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your repo

**Step 2: Configure Service**

```
Name: rescuelena-backend
Region: Choose closest to you
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Step 3: Add Environment Variables**

Go to "Environment" tab and add:

```
GOOGLE_API_KEY=your_gemini_api_key
FIREBASE_CREDENTIALS_JSON={"type":"service_account",...}
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_BUCKET=rescuelena-images
BREVO_API_KEY=your_brevo_key
BREVO_SENDER_EMAIL=your_email
BREVO_SENDER_NAME=RescueLena Alert System
ALERT_EMAILS=recipient@email.com
```

**Step 4: Deploy**

1. Click "Create Web Service"
2. Wait for build (5-10 minutes)
3. Note your backend URL: `https://rescuelena-backend.onrender.com`

### Frontend Deployment

**Option A: Vercel (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. Add environment variable:
   ```
   VITE_API_URL=https://rescuelena-backend.onrender.com
   VITE_WS_URL=https://rescuelena-backend.onrender.com
   ```
5. Deploy

**Option B: Render Static Site**

1. New → "Static Site"
2. Connect repo
3. Configure:
   ```
   Name: rescuelena-frontend
   Root Directory: frontend
   Build Command: npm run build
   Publish Directory: dist
   ```
4. Add environment variables (same as above)
5. Deploy

---

## 🔧 Fixing Common Deployment Issues

### Issue 1: grpcio-tools Build Failure

**Error:**
```
error: command '/usr/bin/g++' failed with exit code 1
ERROR: Failed building wheel for grpcio-tools
```

**Solution:**
Already fixed in requirements.txt with pre-built wheels:
```
grpcio==1.62.0
grpcio-tools==1.62.0
```

### Issue 2: Firebase Credentials

**Error:**
```
Warning: Firebase credentials not configured
```

**Solution:**
Set `FIREBASE_CREDENTIALS_JSON` as environment variable with full JSON:
```json
{"type":"service_account","project_id":"...","private_key":"..."}
```

### Issue 3: CORS Errors

**Error:**
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS
```

**Solution:**
Update `backend/main.py` CORS origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-frontend.vercel.app",
        "https://your-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 4: WebSocket Connection Failed

**Error:**
```
WebSocket connection failed
```

**Solution:**
Ensure `VITE_WS_URL` uses `https://` (not `wss://`). Socket.IO handles the upgrade automatically.

### Issue 5: Cold Starts (Free Tier)

**Issue:**
First request takes 30-60 seconds

**Solutions:**
1. **Upgrade to paid tier** ($7/month)
2. **Keep alive service** - Ping your backend every 10 minutes
3. **Accept it for demo** - Mention it's free tier

---

## 🌐 Alternative: Docker Deployment

### Create Dockerfile (Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Create Dockerfile (Frontend)

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy and build
COPY . .
RUN npm run build

# Production
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - FIREBASE_CREDENTIALS_JSON=${FIREBASE_CREDENTIALS_JSON}
      # ... other env vars
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

---

## 📊 Performance Optimization

### Backend

**1. Use Production ASGI Server**
```bash
# Instead of uvicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**2. Enable Caching**
```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
```

**3. Database Connection Pooling**
Already implemented in Firestore and Qdrant services.

### Frontend

**1. Enable Compression**
Vite automatically minifies and compresses.

**2. Lazy Load Images**
Already implemented with `loading="lazy"`.

**3. Code Splitting**
Vite handles this automatically.

---

## 🔒 Security for Production

### Backend

**1. Add Rate Limiting**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/analyze/image")
@limiter.limit("10/minute")
async def analyze_image(...):
    ...
```

**2. Add Authentication**
```python
from fastapi.security import HTTPBearer
security = HTTPBearer()

@app.post("/analyze/image")
async def analyze_image(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Verify token
    ...
```

**3. Environment Variables**
Never commit `.env` files. Use Render's environment variables.

### Frontend

**1. Environment Variables**
Use `VITE_` prefix for public variables only.

**2. API Key Protection**
Never expose API keys in frontend. All API calls go through backend.

---

## 📈 Monitoring

### Render Built-in

- View logs in Render dashboard
- Monitor CPU/Memory usage
- Set up alerts

### External Monitoring

**Sentry (Error Tracking)**
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

**Uptime Monitoring**
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 💰 Cost Estimation

### Free Tier (Demo)

**Render:**
- Backend: Free (with cold starts)
- Frontend: Free

**External Services:**
- Firebase: Free tier (50k reads/day)
- Qdrant: Free tier (1GB)
- Supabase: Free tier (1GB storage)
- Gemini: Free tier (60 requests/min)
- Brevo: Free tier (300 emails/day)

**Total: $0/month**

### Production (Paid)

**Render:**
- Backend: $7/month (no cold starts)
- Frontend: Free

**External Services:**
- Firebase: $25/month (Blaze plan)
- Qdrant: $25/month (1GB cluster)
- Supabase: $25/month (8GB storage)
- Gemini: Pay-as-you-go (~$50/month)
- Brevo: $25/month (20k emails)

**Total: ~$157/month**

---

## 🚀 Quick Deploy Commands

### Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Update Environment Variables

```bash
# Render CLI (optional)
render env set GOOGLE_API_KEY=your_key
```

### Trigger Redeploy

```bash
# Render auto-deploys on push
git push origin main

# Or manual deploy in Render dashboard
```

---

## ✅ Deployment Checklist

**Before Deploying:**
- [ ] Code pushed to GitHub
- [ ] All environment variables ready
- [ ] Firebase credentials JSON formatted
- [ ] Tested locally
- [ ] Updated CORS origins
- [ ] Removed debug logs

**After Deploying:**
- [ ] Backend health check works
- [ ] Frontend loads
- [ ] WebSocket connects
- [ ] Image upload works
- [ ] Email notifications work
- [ ] Map displays
- [ ] Database operations work

**For Demo:**
- [ ] Clear production database
- [ ] Test full workflow
- [ ] Note backend URL
- [ ] Note frontend URL
- [ ] Prepare for cold start delay

---

## 🆘 Troubleshooting

### Backend Won't Start

1. Check logs in Render dashboard
2. Verify all environment variables set
3. Check requirements.txt syntax
4. Verify Python version (3.11)

### Frontend Won't Load

1. Check build logs
2. Verify VITE_API_URL is correct
3. Check CORS configuration
4. Verify dist folder generated

### Database Connection Failed

1. Check Firebase credentials JSON
2. Verify Qdrant URL and API key
3. Check Supabase credentials
4. Test connections locally first

### Email Not Sending

1. Verify Brevo API key
2. Check sender email verified
3. Check recipient email format
4. View Brevo dashboard for errors

---

## 📝 Post-Deployment

### Share Your Project

**URLs to Share:**
- Frontend: `https://rescuelena.vercel.app`
- Backend: `https://rescuelena-backend.onrender.com`
- API Docs: `https://rescuelena-backend.onrender.com/docs`
- GitHub: `https://github.com/yourusername/rescuelena`

### Demo Preparation

1. Clear production database
2. Test all features
3. Prepare demo images
4. Note any cold start delays
5. Have backup local version ready

---

## 🎯 For Hackathon

**Recommended Approach:**

1. **Deploy to Render** (both frontend and backend)
2. **Test thoroughly** before presentation
3. **Have local backup** running during demo
4. **Mention it's deployed** to judges
5. **Share live URL** in presentation

**If deployment fails:**
- Demo locally (perfectly fine!)
- Mention "production deployment in progress"
- Show deployment configuration
- Judges understand time constraints

---

## 🏆 Production Deployment (Post-Hackathon)

### Recommended Stack

**Frontend:** Vercel  
**Backend:** Railway or Render (paid)  
**Database:** Firebase (Blaze plan)  
**Vector DB:** Qdrant Cloud (paid)  
**Storage:** Supabase (paid)  
**Email:** Brevo (paid)  
**Monitoring:** Sentry + Uptime Robot  

**Total Cost:** ~$200/month for production-ready deployment

---

**Good luck with deployment! 🚀**

If you encounter issues, the local version works perfectly for the hackathon demo!
