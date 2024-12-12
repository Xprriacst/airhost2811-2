import { z } from 'zod';

// Validation schema for environment variables
const envSchema = z.object({
  airtable: z.object({
    apiKey: z.string().min(1, 'Airtable API key is required'),
    baseId: z.string().min(1, 'Airtable Base ID is required'),
  }),
  openai: z.object({
    apiKey: z.string().min(1, 'OpenAI API key is required'),
  }),
});

// Function to get environment variables based on context
const getEnvVar = (key: string): string => {
  try {
    // Vite context
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || '';
    }
  } catch {
    // Ignore if import.meta.env is not available
  }

  // Node.js context (Netlify Functions)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }

  return '';
};

// Environment variables
export const env = {
  airtable: {
    apiKey: getEnvVar('AIRTABLE_API_KEY') || getEnvVar('VITE_AIRTABLE_API_KEY'),
    baseId: getEnvVar('AIRTABLE_BASE_ID') || getEnvVar('VITE_AIRTABLE_BASE_ID'),
  },
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY') || getEnvVar('VITE_OPENAI_API_KEY'),
  },
};

// Validate environment variables
const validateEnv = () => {
  try {
    envSchema.parse(env);
    console.log('Environment variables are valid.');
    return true;
  } catch (error) {
    console.error('Environment validation failed:', error);
    return false;
  }
};

export const isConfigValid = validateEnv();