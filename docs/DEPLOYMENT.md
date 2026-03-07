# DoorKey Deployment Guide

Complete guide for deploying the DoorKey property listing platform to production.

## Pre-Deployment Checklist

- [ ] Update environment variables in `.env.production`
- [ ] Run `pnpm build` and verify no errors
- [ ] Run `pnpm lint` and fix any issues
- [ ] Test all critical user flows
- [ ] Update database connection strings
- [ ] Setup logging and error tracking
- [ ] Configure CORS properly
- [ ] Setup email service for notifications
- [ ] Configure CDN for static assets
- [ ] Setup SSL/TLS certificates

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

#### Setup

1. **Connect GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select framework: Next.js
   - Configure environment variables in project settings
   - Click "Deploy"

#### Environment Variables (Vercel)

In Vercel project settings, add:

```
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
STRIPE_PUBLIC_KEY=<stripe-public-key>
STRIPE_SECRET_KEY=<stripe-secret-key>
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

#### Auto-Deploy

Enable automatic deployments:
- Main branch → Production
- Other branches → Preview deployments

---

### 2. Docker Deployment

#### Create Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

# Production image
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["pnpm", "start"]
```

#### Build and Run

```bash
# Build image
docker build -t doorkey:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  doorkey:latest

# Push to Docker Hub (optional)
docker tag doorkey:latest yourusername/doorkey:latest
docker push yourusername/doorkey:latest
```

---

### 3. Self-Hosted (Linux/Ubuntu)

#### Prerequisites

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
node --version  # Verify installation

# Install pnpm
npm install -g pnpm

# Install PostgreSQL (if using local database)
sudo apt-get install postgresql postgresql-contrib -y

# Install Nginx (reverse proxy)
sudo apt-get install nginx -y
```

#### Deploy Application

```bash
# Clone repository
git clone <your-repo-url> /var/www/doorkey
cd /var/www/doorkey

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.production
# Edit .env.production with production values
nano .env.production

# Build application
pnpm build

# Start application using PM2
npm install -g pm2
pm2 start "pnpm start" --name "doorkey"
pm2 save
pm2 startup
```

#### Configure Nginx

```nginx
# /etc/nginx/sites-available/doorkey
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000/_next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/doorkey /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 4. AWS Deployment

#### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init -p "Node.js 18" doorkey

# Create environment
eb create doorkey-prod

# Deploy application
git add .
git commit -m "Deploy to production"
eb deploy

# View logs
eb logs

# SSH into instance
eb ssh
```

#### Using EC2

1. Launch EC2 instance (Ubuntu 20.04 LTS)
2. Follow "Self-Hosted" instructions above
3. Configure security groups for HTTP/HTTPS
4. Setup RDS for PostgreSQL
5. Setup S3 for file storage (images)

---

## Database Setup

### PostgreSQL Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE doorkey;

# Create user
CREATE USER doorkey_user WITH PASSWORD 'strong_password';

# Grant permissions
ALTER ROLE doorkey_user SET client_encoding TO 'utf8';
ALTER ROLE doorkey_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE doorkey_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE doorkey TO doorkey_user;

# Connect and setup schema
\c doorkey
\i schema.sql
```

### Environment Variables

```
DATABASE_URL=postgresql://doorkey_user:password@localhost:5432/doorkey
```

---

## Security Considerations

### SSL/TLS Certificates

```bash
# Using Let's Encrypt with Certbot
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

### Environment Secrets

Never commit secrets:

```bash
# .gitignore
.env.local
.env.production.local
.env*.local
secrets/
```

### Rate Limiting

Add rate limiting in Nginx:

```nginx
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

location /api {
    limit_req zone=api burst=10;
}
```

### CORS Configuration

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};
```

---

## Monitoring & Logging

### Application Logs

```bash
# Using PM2
pm2 logs doorkey

# View specific log
pm2 logs doorkey --lines 100
```

### Error Tracking

Setup Sentry for error tracking:

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring

Monitor with:
- Google Analytics
- Vercel Analytics
- New Relic
- DataDog

---

## Backup Strategy

### Database Backups

```bash
# Daily PostgreSQL backup
0 2 * * * pg_dump -U doorkey_user doorkey > /backups/doorkey_$(date +\%Y\%m\%d).sql

# Store in S3
0 3 * * * aws s3 cp /backups/doorkey_*.sql s3://my-backups/doorkey/
```

### File Backups

- Use Vercel Blob for automatic backups
- Or sync to S3 daily

---

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linter
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test
      
      - name: Build application
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true
```

---

## Post-Deployment

### Health Checks

```bash
# Test API endpoint
curl -X GET https://your-domain.com/api/properties

# Check database connection
curl -X GET https://your-domain.com/api/health
```

### Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 100 https://your-domain.com/

# Using LoadImpact or JMeter
```

### User Communication

- Send deployment notification to team
- Post status on status page
- Monitor support channels for issues

---

## Troubleshooting

### Common Issues

**Application won't start**
```bash
# Check logs
pm2 logs doorkey

# Verify environment variables
printenv | grep DATABASE_URL

# Rebuild
pnpm build
```

**Database connection error**
```bash
# Test database connection
psql -h localhost -U doorkey_user -d doorkey

# Check DATABASE_URL format
# postgresql://user:password@host:port/database
```

**Out of memory**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=2048" pnpm start
```

**High CPU usage**
- Check for infinite loops in code
- Monitor database queries
- Implement caching
- Optimize database indexes

---

## Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git revert HEAD
git push
eb deploy  # Or appropriate deploy command

# Or use saved PM2 snapshot
pm2 resurrect
```

---

## Performance Optimization

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/property.jpg"
  alt="Property"
  width={800}
  height={600}
  priority
/>
```

### Code Splitting

```typescript
// Dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

### Caching Strategy

- Static pages: Cache for 1 year
- API responses: Cache for 5 minutes
- User data: No cache (private)

---

## Maintenance

### Regular Tasks

- [ ] Monitor error logs daily
- [ ] Review performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Test disaster recovery quarterly
- [ ] Security audit bi-annually

### Dependencies Update

```bash
# Check for updates
pnpm outdated

# Update all dependencies
pnpm update

# Update specific package
pnpm add package@latest

# Always test after updates
pnpm build && pnpm test
```

---

For additional support, refer to:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
