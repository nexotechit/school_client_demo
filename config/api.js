// API Configuration - HARDCODED for Vercel deployment
// DO NOT rely on environment variables as they are evaluated at build time

// API configuration — prefer local API during development when running on localhost
const PROD_API = 'https://api.school.nexotechit.com';
const LOCAL_API = 'http://localhost:5000';

export const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? LOCAL_API : PROD_API;
export const API_BASE_URL = `${API_URL}/api`;

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', { API_URL, API_BASE_URL });
}



