import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function require(name, fallback) {
  const val = process.env[name] || fallback;
  if (val === undefined) return { name, missing: true, val: undefined };
  return { name, missing: false, val };
}

/**
 * validateEnv — called once at startup.
 * Prints every missing required variable and exits with code 1.
 * Optional variables are listed with their defaults.
 */
export function validateEnv() {
  const required = [
    require('ADMIN_PASSWORD', undefined),
    require('SESSION_SECRET', undefined),
  ];
  const missing = required.filter(r => r.missing);
  if (missing.length > 0) {
    console.error('\n[env] SERVER WILL NOT START — missing required environment variables:');
    missing.forEach(r => console.error(`  ✗  ${r.name}`));
    console.error('\nCopy backend/.env.example to backend/.env and fill in the missing values.\n');
    process.exit(1);
  }
}

export const env = {
  NODE_ENV:           process.env.NODE_ENV           || 'development',
  PORT:               parseInt(process.env.PORT      || '3000', 10),
  MONGO_URI:          process.env.MONGO_URI          || '',
  ADMIN_PASSWORD:     process.env.ADMIN_PASSWORD     || '',
  SESSION_SECRET:     process.env.SESSION_SECRET     || '',
  CORS_ORIGINS:       (process.env.CORS_ORIGINS      || 'http://localhost:5173').split(',').map(s => s.trim()),
  DATA_DIR:           process.env.DATA_DIR           || path.resolve(__dirname, '../data'),
  UPLOADS_DIR:        process.env.UPLOADS_DIR        || path.resolve(__dirname, '../uploads'),
  GMAIL_USER:         process.env.GMAIL_USER         || '',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || '',
  CONTACT_EMAIL:      process.env.CONTACT_EMAIL      || '',
  RAZORPAY_KEY_ID:    process.env.RAZORPAY_KEY_ID    || '',
  RAZORPAY_SECRET:    process.env.RAZORPAY_SECRET    || '',
  // Optional — a Google Apps Script "Web App" URL that accepts a POST of
  // { subscribers: string[] } and appends them to a Google Sheet. Leave
  // blank to disable "Sync to Sheet" (it will return a clear message instead
  // of a bare 501). See DEPLOYMENT.md for how to set one up.
  GOOGLE_SHEETS_WEBHOOK_URL: process.env.GOOGLE_SHEETS_WEBHOOK_URL || '',
};
