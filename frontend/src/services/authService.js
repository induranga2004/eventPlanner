import * as authAPI from '../api/auth';

class AuthService {
  // Regular authentication methods
  async login(email, password) {
    return await authAPI.login(email, password);
  }

  async register(formData) {
    return await authAPI.register(formData);
  }

  async requestPasswordReset(email) {
    return await authAPI.requestPasswordReset(email);
  }

  async getCurrentUser() {
    return await authAPI.me();
  }

  // Two-Factor Authentication methods
  async setup2FA() {
    return await authAPI.setup2FA();
  }

  async enable2FA(token) {
    return await authAPI.enable2FA(token);
  }

  async verify2FA({ email, token, isBackupCode = false }) {
    return await authAPI.verify2FA({ email, token, isBackupCode });
  }

  async disable2FA({ token, password }) {
    return await authAPI.disable2FA({ token, password });
  }

  async get2FAStatus() {
    return await authAPI.get2FAStatus();
  }

  async generateNewBackupCodes(token) {
    return await authAPI.generateNewBackupCodes(token);
  }

  // Token management
  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getCurrentUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export const authService = new AuthService();