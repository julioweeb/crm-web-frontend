// public/config.js define este valor no navegador. Ele continua apontando
// para o back-end local quando o CRM roda em desenvolvimento.
declare global {
  interface Window {
    __CRM_CONFIG__?: { apiUrl?: string };
  }
}

export const API_URL = (window.__CRM_CONFIG__?.apiUrl || 'http://localhost:5080/api').replace(/\/$/, '');
