// Environment-based API configuration
export const getApiBaseUrl = (): string => {
  // Check if we're in the browser (client-side)
  if (typeof window !== "undefined") {
    // Client-side: use environment variable or fallback
    return process.env.NEXT_PUBLIC_API_BASE || getDefaultApiUrl();
  }

  // Server-side: use environment variable or fallback
  return process.env.NEXT_PUBLIC_API_BASE || getDefaultApiUrl();
};

// Get default API URL based on environment
const getDefaultApiUrl = (): string => {
  const environment =
    process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV;

  switch (environment) {
    case "production":
      return "https://openassignserver.fly.dev"; // Your production API URL
    case "development":
    case "local":
    default:
      return "http://localhost:3000"; // Your local API URL
  }
};

// Environment detection utilities
export const isProduction = (): boolean => {
  return (
    process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ||
    process.env.NODE_ENV === "production"
  );
};

export const isDevelopment = (): boolean => {
  return (
    process.env.NEXT_PUBLIC_ENVIRONMENT === "development" ||
    process.env.NODE_ENV === "development"
  );
};

// Get current environment info
export const getEnvironmentInfo = () => {
  return {
    environment:
      process.env.NEXT_PUBLIC_ENVIRONMENT ||
      process.env.NODE_ENV ||
      "development",
    apiBaseUrl: getApiBaseUrl(),
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
  };
};
