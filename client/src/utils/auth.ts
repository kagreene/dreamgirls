import * as jwt from 'jwt-decode';
const decode = jwt.jwtDecode;

// Create a new class to instantiate for a user
class AuthService {
  // Get user data from JWT
  getProfile() {
    const token = this.getToken();
    return token ? decode(token) : null;
  }

  // Check if user is logged in
  loggedIn() {
    // Check if there is a saved token and it's still valid
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Check if token is expired
  isTokenExpired(token: string) {
    try {
      const decoded: any = decode(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      } else return false;
    } catch (err) {
      return false;
    }
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('id_token');
  }

  // Save token to localStorage and reload page to home
  login(idToken: string) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  // Clear token from localStorage and force logout with reload
  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new AuthService();