// Get API base URL - prioritize environment variable, fallback to production
export const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE;
}; 