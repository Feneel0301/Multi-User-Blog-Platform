# Production Deployment Guide (Vercel & Render/Railway)

This guide walks you through deploying the **Multi-User Blog Platform** frontend to **Vercel** and the backend to **Render** or **Railway**.

---

## Phase 1: Database Whitelist (MongoDB Atlas)
Because cloud hosting providers (Vercel, Render, Railway) use dynamic IP addresses, you must allow incoming connections from all locations in MongoDB Atlas:
1. Log in to the [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Navigate to **Network Access** under the Security tab on the left sidebar.
3. Click **Add IP Address**.
4. Choose **Allow Access From Anywhere** (adds `0.0.0.0/0`) and click **Confirm**.

---

## Phase 2: Deploy the Backend (Render or Railway)
Deploy the backend first so you have the production API URL ready for the frontend.

### Option A: Render Setup
1. Create an account or log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository and select the repository containing this project.
4. Configure the Web Service settings:
   - **Name**: `blog-platform-backend`
   - **Root Directory**: `backend` (or leave empty if deploying a standalone backend repository)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** and add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *Your MongoDB Connection String*
   - `JWT_SECRET`: *A secure random string (e.g. `openssl rand -base64 32`)*
   - `CLOUDINARY_CLOUD_NAME`: *Your Cloudinary Cloud Name*
   - `CLOUDINARY_API_KEY`: *Your Cloudinary API Key*
   - `CLOUDINARY_API_SECRET`: *Your Cloudinary API Secret*
6. Click **Create Web Service**. 
7. Copy the generated Web Service URL (e.g., `https://blog-platform-backend.onrender.com`). Your API URL will be that URL with `/api` appended (e.g., `https://blog-platform-backend.onrender.com/api`).

### Option B: Railway Setup
1. Log in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Once added, click on the service card, go to **Settings**, and set the **Root Directory** to `backend`.
5. Navigate to the **Variables** tab and insert the same environment variables as listed in the Render section.
6. Under **Settings**, click **Generate Domain** to get your backend domain.

---

## Phase 3: Deploy the Frontend (Vercel)
Next.js apps are optimized to run natively on Vercel.

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. In the configuration window:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click edit and select the `frontend` folder.
5. Expand the **Environment Variables** section and add:
   - `AUTH_SECRET`: *A secure random secret (e.g. `openssl rand -base64 32`)*
   - `AUTH_URL`: *Your production frontend Vercel URL (e.g. `https://your-app-name.vercel.app`)*
   - `BACKEND_URL`: *Your production backend URL + `/api` (e.g. `https://blog-platform-backend.onrender.com/api`)*
   - `NEXT_PUBLIC_BACKEND_URL`: *Same as `BACKEND_URL`*
   - `AUTH_GOOGLE_ID`: *Your Google Client ID*
   - `AUTH_GOOGLE_SECRET`: *Your Google Client Secret*
6. Click **Deploy**. Vercel will build, optimize, and launch your application.

---

## Phase 4: Configure Google OAuth Redirect URLs
To enable Google Sign-In in production:
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project and navigate to **APIs & Services** -> **Credentials**.
3. Under **OAuth 2.0 Client IDs**, edit your Google Auth Client.
4. Add your production domain under **Authorized JavaScript origins**:
   - `https://your-app-name.vercel.app`
5. Add the NextAuth Google redirect URI under **Authorized redirect URIs**:
   - `https://your-app-name.vercel.app/api/auth/callback/google`
6. Save the settings (changes can take up to 5 minutes to propagate).

---

## Summary Checklist
- [ ] MongoDB whitelist configured for `0.0.0.0/0`.
- [ ] Backend deployed with correct `MONGO_URI`, `JWT_SECRET`, and `CLOUDINARY_*` credentials.
- [ ] Frontend deployed on Vercel pointing to the production backend API.
- [ ] `AUTH_URL` matches the Vercel production deployment URL.
- [ ] Google Credentials updated with Vercel URL origins and callbacks.
