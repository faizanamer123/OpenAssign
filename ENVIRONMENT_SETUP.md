# Environment Setup Guide

This guide explains how to configure different API URLs for local development and production environments.

## Quick Setup

### 1. Create Environment Files

Create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
```

### 2. For Production Deployment

Set these environment variables in your production environment:

```bash
# Production environment variables
NEXT_PUBLIC_API_BASE=https://openassignserver.fly.dev
NEXT_PUBLIC_ENVIRONMENT=production
```

## Environment Variables

| Variable                  | Description            | Local Default           | Production                         |
| ------------------------- | ---------------------- | ----------------------- | ---------------------------------- |
| `NEXT_PUBLIC_API_BASE`    | Base URL for API calls | `http://localhost:3001` | `https://openassignserver.fly.dev` |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment identifier | `development`           | `production`                       |

## How It Works

The API configuration automatically detects your environment and uses the appropriate URL:

- **Local Development**: Uses `http://localhost:3001` (or your custom local URL)
- **Production**: Uses `https://openassignserver.fly.dev` (or your custom production URL)

## Usage Examples

### In Your Code

```typescript
import { getApiBaseUrl, getEnvironmentInfo } from "@/config/api";

// Get the current API base URL
const apiUrl = getApiBaseUrl();

// Get environment information
const envInfo = getEnvironmentInfo();
console.log("Current environment:", envInfo.environment);
console.log("API URL:", envInfo.apiBaseUrl);
```

### Environment Detection

```typescript
import { isProduction, isDevelopment } from "@/config/api";

if (isDevelopment()) {
  console.log("Running in development mode");
}

if (isProduction()) {
  console.log("Running in production mode");
}
```

## Deployment Platforms

### Vercel

Set environment variables in your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the variables listed above

### Netlify

Set environment variables in your Netlify dashboard:

1. Go to Site settings
2. Navigate to "Environment variables"
3. Add the variables listed above

### Fly.io

Set environment variables using the Fly CLI:

```bash
fly secrets set NEXT_PUBLIC_API_BASE=https://openassignserver.fly.dev
fly secrets set NEXT_PUBLIC_ENVIRONMENT=production
```

## Troubleshooting

### API URL Not Updating

1. Make sure your environment variables start with `NEXT_PUBLIC_`
2. Restart your development server after changing environment variables
3. Check that the `.env.local` file is in your project root

### Environment Detection Issues

1. Verify your `NEXT_PUBLIC_ENVIRONMENT` variable is set correctly
2. Check that `NODE_ENV` is set properly in your deployment environment

## Development Tips

- Use `console.log(getEnvironmentInfo())` to debug environment configuration
- The system automatically falls back to sensible defaults if environment variables are not set
- Environment variables are validated on startup in development mode
