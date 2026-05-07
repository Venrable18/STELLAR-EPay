# STELLAR-EPay Frontend - Testing & Deployment Guide

## Overview
This document provides instructions for testing, building, and deploying the STELLAR-EPay frontend.

## Prerequisites
- Node.js 18+ and npm
- Git
- `.env.local` file configured with actual contract IDs

## Development Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
# Copy the example configuration
cp .env.example .env.local

# Edit .env.local and add:
# - VITE_POOL_CONTRACT_ID=<your_pool_contract_address>
# - VITE_VERIFIER_CONTRACT_ID=<your_verifier_contract_address>
# - VITE_TOKEN_ID=<your_token_address>
```

### 3. Start Development Server
```bash
npm run dev
```
Server runs on `http://localhost:5173`

## Testing

### Manual Testing Checklist

#### Page Navigation
- [ ] All navigation tabs render correctly
- [ ] Tab switching updates page content
- [ ] Active tab is highlighted

#### Deposit Page
- [ ] Form displays all required fields
- [ ] Form validation works (amount > 0)
- [ ] Submit button shows loading state
- [ ] Result card displays after submission
- [ ] Pool info card shows current state
- [ ] Mobile layout is responsive

#### Transfer Page
- [ ] Note selector displays mock notes
- [ ] Note details update when selection changes
- [ ] Amount validation prevents exceeding note value
- [ ] Form submission works
- [ ] Result shows proof validity and new commitment
- [ ] Available notes card shows all notes

#### Withdraw Page
- [ ] Note selector functions properly
- [ ] Stellar address validation works (must start with "G")
- [ ] Amount validation prevents exceeding note value
- [ ] Form submission triggers result display
- [ ] Pool status card shows accurate data
- [ ] Responsive design on mobile

#### Notes Inspector Page
- [ ] Notes table displays all mock notes
- [ ] Sorting works on table columns
- [ ] Filtering updates note display
- [ ] Statistics cards show correct values
- [ ] Note details panel displays when clicking a note
- [ ] Delete button appears but doesn't break UI

#### Wallet Connection
- [ ] Wallet status shows in header
- [ ] Connect button is visible
- [ ] Placeholder state works before integration

#### Animations & Polish
- [ ] Page transitions fade in smoothly
- [ ] Messages slide in from left
- [ ] Buttons have hover/active states
- [ ] Loading spinner animates
- [ ] Focus states are visible (accessibility)

### Automated Testing (Future Phase 2)
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

## Build for Production

### 1. Build the Application
```bash
npm run build
```
Output: `frontend/dist/`

### 2. Preview Production Build
```bash
npm run preview
```

### 3. Check Build Output
```bash
# Verify all files are included
ls -la dist/
cat dist/index.html
```

## Deployment

### Option 1: Static Hosting (Recommended for Phase 1)

#### Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow prompts, set environment variables during deployment
```

#### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Deploy to GitHub Pages
```bash
# Update vite.config.ts with base: "/STELLAR-EPay/"
npm run build
git add dist/
git commit -m "Deployment: production build"
git push origin main
```

### Option 2: Docker Deployment
```bash
# Create Dockerfile (included in repo)
docker build -t stellar-epay-frontend .
docker run -p 80:3000 stellar-epay-frontend
```

### Option 3: Self-Hosted Server
```bash
# Copy dist/ to server
scp -r dist/ user@server:/var/www/stellar-epay/

# Set up Nginx reverse proxy (example config)
# See deployment/nginx.conf
```

## Environment Variables in Production

Create `.env.production` with production contract addresses:
```env
VITE_SOROBAN_RPC_URL=https://soroban-mainnet.stellar.org
VITE_POOL_CONTRACT_ID=<production_pool_contract>
VITE_VERIFIER_CONTRACT_ID=<production_verifier_contract>
VITE_TOKEN_ID=<production_token_id>
VITE_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015
VITE_ENV=production
```

## Phase 2: SDK Integration Testing

After contracts are deployed, test SDK integration:

### 1. Update SDK Configuration
```typescript
// src/services/sdk.ts
const sdk = initSDK({
  contractId: "C...",
  verifierContractId: "C...",
  networkPassphrase: "Public Global Stellar Network ; September 2015",
  serverUrl: "https://soroban-mainnet.stellar.org",
});
```

### 2. Test Contract Interactions
```bash
# Enable debug logging
VITE_DEBUG=true npm run dev

# Check browser console for SDK calls
# Verify transactions in Stellar Explorer
```

### 3. Load Testing
```bash
# Simulate multiple users
npm run test:load
```

## Troubleshooting

### Issue: "Contract ID not set"
**Solution:** Ensure `.env.local` exists and has all required variables

### Issue: "Build fails with TypeScript errors"
**Solution:** Run `npm run type-check` to verify types

### Issue: "Animations not smooth"
**Solution:** Check browser performance tab, ensure GPU acceleration enabled

### Issue: "Form validation not working"
**Solution:** Check browser console for JS errors, verify validation helper exports

### Issue: "Network requests failing"
**Solution:** Verify Soroban RPC URL is correct, check CORS headers

## Performance Optimization

### Bundle Size
```bash
npm run analyze  # Analyze bundle size
```

### Caching Strategy
- Static assets: Cache for 1 year
- HTML: No cache (always fresh)
- JS/CSS: Cache-bust with content hash

### Image Optimization
- Use WebP format where possible
- Lazy load below-fold images
- Optimize SVGs inline

## Security Checklist

- [ ] No sensitive keys in version control
- [ ] Environment variables not logged in production
- [ ] HTTPS enforced in production
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] CSRF tokens validated (if applicable)
- [ ] Input validation on all forms
- [ ] No hardcoded contract addresses

## Monitoring & Logs

### Client-Side Monitoring
```typescript
// Enable in .env
VITE_DEBUG=true

// Check browser console for:
// - SDK operations
// - Form submissions
// - Network requests
// - Errors
```

### Server-Side Monitoring (Phase 2)
- Set up error tracking (Sentry, Datadog)
- Configure performance monitoring
- Track contract interaction metrics

## Rollback Procedure

```bash
# If deployment fails
git revert <commit-hash>
npm run build
# Redeploy previous version
```

## Next Steps (Phase 2)

1. **SDK Integration**
   - Replace mock functions with actual Soroban calls
   - Add transaction signing with Stellar wallets
   - Implement real proof generation

2. **Backend Integration**
   - Set up API server for proof generation
   - Implement note persistence
   - Add user authentication

3. **Testing**
   - Add unit tests for components
   - Add e2e tests for user flows
   - Load test with multiple concurrent users

4. **DevOps**
   - Set up CI/CD pipeline
   - Automated deployments on main branch
   - Staging environment for testing

---

**For questions or issues, see README.md or open an issue on GitHub.**
