# Deployment Guide

This guide covers deploying Open Radio to various platforms for production use.

## Quick Deploy Options

### Vercel (Recommended)

The easiest way to deploy Open Radio is using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/open-radio)

**One-click deployment:**
1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables
4. Deploy!

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/open-radio)

## Manual Deployment

### Prerequisites

- Node.js 22.0.0 or higher
- Your API keys (YouTube, Firebase if using)
- A hosting platform account

### Build for Production

```bash
# Clone the repository
git clone https://github.com/your-username/open-radio.git
cd open-radio

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.local.example .env.local
# Edit .env.local with your production values

# Build the application
npm run build

# Test the production build locally
npm start
```

## Platform-Specific Guides

### Vercel Deployment

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login and Deploy**
```bash
vercel login
vercel --prod
```

**Step 3: Configure Environment Variables**
In the Vercel dashboard or via CLI:
```bash
vercel env add NEXT_PUBLIC_YOUTUBE_API_KEY
vercel env add NEXT_PUBLIC_APP_NAME
# Add other environment variables as needed
```

**Step 4: Custom Domain (Optional)**
```bash
vercel domains add your-domain.com
```

### Netlify Deployment

**Step 1: Build Settings**
- Build command: `npm run build`
- Publish directory: `out`
- Node version: `22`

**Step 2: Environment Variables**
In Netlify dashboard under Site settings > Environment variables:
```
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key
NEXT_PUBLIC_APP_NAME=Your Radio Name
NEXT_PUBLIC_FIREBASE_ENABLED=true
```

**Step 3: Deploy**
```bash
# Build for static export
npm run build
npm run export

# Deploy to Netlify
npx netlify-cli deploy --prod --dir=out
```

### DigitalOcean App Platform

**Step 1: Create App**
1. Go to DigitalOcean App Platform
2. Create new app from GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Run command: `npm start`
   - Environment: Node.js

**Step 2: Environment Variables**
Add in App Platform dashboard:
```
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key
NEXT_PUBLIC_APP_NAME=Your Radio Name
```

### Railway

**Step 1: Deploy from GitHub**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

**Step 2: Configure Environment**
```bash
railway variables set NEXT_PUBLIC_YOUTUBE_API_KEY=your_key
railway variables set NEXT_PUBLIC_APP_NAME="Your Radio Name"
```

### Docker Deployment

**Step 1: Create Dockerfile**
```dockerfile
FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build the app
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Step 2: Build and Run**
```bash
# Build image
docker build -t open-radio .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_YOUTUBE_API_KEY=your_key \
  -e NEXT_PUBLIC_APP_NAME="Your Radio Name" \
  open-radio
```

### Traditional VPS/Server

**Step 1: Server Setup**
```bash
# Update system (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx
```

**Step 2: Deploy Application**
```bash
# Clone and build
git clone https://github.com/your-username/open-radio.git
cd open-radio
npm install
npm run build

# Start with PM2
pm2 start npm --name "open-radio" -- start
pm2 startup
pm2 save
```

**Step 3: Configure Nginx (Optional)**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables for Production

### Required Variables

```bash
# YouTube API (Required)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_production_youtube_api_key

# App Configuration
NEXT_PUBLIC_APP_NAME="Your Radio Station Name"
NEXT_PUBLIC_APP_DESCRIPTION="Your radio station description"
```

### Optional Variables

```bash
# Playlist Configuration
NEXT_PUBLIC_PLAYLIST_ID=your_default_playlist_id

# Branding
NEXT_PUBLIC_BRANDING_ENABLED=true

# Firebase (if using real-time features)
NEXT_PUBLIC_FIREBASE_ENABLED=true
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Production Optimizations

### Performance

**Next.js Configuration** (`next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['i.ytimg.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Security

**Environment Variable Security:**
- Never commit `.env` files to version control
- Use platform-specific secret management
- Rotate API keys regularly
- Restrict API keys to your domain

**Content Security Policy:**
```javascript
// next.config.js
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://i.ytimg.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};
```

## Monitoring and Maintenance

### Health Checks

**Basic health check endpoint** (`app/api/health/route.ts`):
```typescript
export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
}
```

### Logging

**Production logging with PM2:**
```bash
# View logs
pm2 logs open-radio

# Log rotation
pm2 install pm2-logrotate
```

### Updates

**Automated deployment with GitHub Actions:**
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Troubleshooting

### Common Issues

**Build failures:**
- Ensure Node.js version is 22+
- Check all environment variables are set
- Verify API keys are valid

**Runtime errors:**
- Check browser console for client-side errors
- Verify API endpoints are accessible
- Test YouTube API quota and permissions

**Performance issues:**
- Enable compression and caching
- Optimize images and assets
- Monitor API response times

### Support Resources

- **Documentation**: [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **GitHub Issues**: [Report deployment issues](https://github.com/your-username/open-radio/issues)
- **Community**: [GitHub Discussions](https://github.com/your-username/open-radio/discussions)

## Cost Considerations

### Free Tier Options

- **Vercel**: 100GB bandwidth, unlimited personal projects
- **Netlify**: 100GB bandwidth, 300 build minutes
- **Railway**: $5/month for production apps
- **Firebase**: Generous free tier for real-time database

### API Costs

- **YouTube API**: Free tier with daily quotas
- **Firebase**: Pay-as-you-go beyond free tier
- **Domain**: $10-15/year for custom domain

For most personal/small projects, Open Radio can run entirely on free tiers.