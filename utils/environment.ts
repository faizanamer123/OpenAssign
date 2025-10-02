// Environment utility functions
import { getApiBaseUrl, getEnvironmentInfo } from "@/config/api";

// Environment configuration
export const ENV_CONFIG = {
  // API URLs
  LOCAL_API_URL: "http://localhost:3001",
  PRODUCTION_API_URL: "https://openassignserver.fly.dev",

  // Environment names
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  LOCAL: "local",
} as const;

// Get current environment
export const getCurrentEnvironment = (): string => {
  return (
    process.env.NEXT_PUBLIC_ENVIRONMENT ||
    process.env.NODE_ENV ||
    ENV_CONFIG.DEVELOPMENT
  );
};

// Check if running in specific environment
export const isEnvironment = (env: string): boolean => {
  return getCurrentEnvironment() === env;
};

// Get API URL for specific environment
export const getApiUrlForEnvironment = (env: string): string => {
  switch (env) {
    case ENV_CONFIG.PRODUCTION:
      return ENV_CONFIG.PRODUCTION_API_URL;
    case ENV_CONFIG.DEVELOPMENT:
    case ENV_CONFIG.LOCAL:
    default:
      return ENV_CONFIG.LOCAL_API_URL;
  }
};

// Debug function to log environment info
export const logEnvironmentInfo = (): void => {
  if (process.env.NODE_ENV === "development") {
    const envInfo = getEnvironmentInfo();
    console.log("🌍 Environment Info:", {
      environment: envInfo.environment,
      apiBaseUrl: envInfo.apiBaseUrl,
      isProduction: envInfo.isProduction,
      isDevelopment: envInfo.isDevelopment,
    });
  }
};

// Validate environment configuration
export const validateEnvironment = (): boolean => {
  const apiUrl = getApiBaseUrl();
  const environment = getCurrentEnvironment();

  // Basic validation
  if (!apiUrl) {
    console.error("❌ API URL is not configured");
    return false;
  }

  if (!environment) {
    console.error("❌ Environment is not configured");
    return false;
  }

  // Log in development
  if (environment === ENV_CONFIG.DEVELOPMENT) {
    console.log("✅ Environment validation passed:", {
      environment,
      apiUrl,
    });
  }

  return true;
};
