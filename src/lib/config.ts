export const API_BASE: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  (typeof process !== 'undefined' && (process as any).env?.VITE_API_BASE) ||
  'https://instructorscopilot-main.onrender.com';
