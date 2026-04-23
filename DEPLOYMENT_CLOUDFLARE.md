# SolarGear Kenya Deployment Guide (Cloudflare)

This guide explains how to deploy the SolarGear Kenya web application to **Cloudflare Pages**.

## 1. Prerequisites
- A [Cloudflare Account](https://dash.cloudflare.com/sign-up).
- Your code pushed to a GitHub or GitLab repository.
- A Supabase project (already configured in the app).

## 2. Deployment Steps

### Method A: Git Integration (Recommended)
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/login).
2. Go to **Workers & Pages** > **Pages** > **Connect to Git**.
3. Select your repository.
4. **Build Settings**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. **Environment Variables**:
   Add the following variables in the Cloudflare dashboard under **Settings** > **Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Project Anon Key.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
6. Click **Save and Deploy**.

### Method B: Manual Upload (Using Wrangler CLI)
If you prefer deploying from your local terminal:
1. Install Wrangler: `npm install -g wrangler`
2. Build the project: `npm run build`
3. Deploy: `wrangler pages deploy dist`

## 3. Post-Deployment Configuration
- **Custom Domain**: In the Cloudflare Pages dashboard, go to the **Custom domains** tab to connect your own domain (e.g., `solargear.co.ke`).
- **SPA Fallback**: Cloudflare Pages handles SPA routing automatically if you use the `Vite` preset. If you experience 404 errors on refreshes, ensure a `_redirects` file exists in your `public` folder with:
  ```
  /* /index.html 200
  ```

## 4. Admin Access
Only `solargearlrd@gmail.com` is configured to have access to the `/admin` routes. Ensure you sign in with this email to manage products, categories, and blog posts.

---
*SolarGear Kenya - Powering the future.*
