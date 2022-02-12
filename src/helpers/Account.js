class Account {
  static set(data) {
    localStorage.setItem('account', JSON.stringify(data));
  }

  static get() {
    try {
      return JSON.parse(localStorage.getItem('account')) || {};
    } catch (e) {
      return {};
    }
  }

  static add(data) {
    this.set({ ...this.get(), ...data });
  }

  static getToken() {
    return localStorage.getItem('token') || '';
  }

  static setToken(token) {
    localStorage.setItem('token', token);
  }

  static delete() {
    localStorage.removeItem('token');
    localStorage.removeItem('account');
  }
}

export default Account;
