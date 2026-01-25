class UserLanguageManager {
  constructor() {
    this.userLanguages = new Map();
    this.defaultLanguage = 'en';
  }

  getLanguage(userId) {
    return this.userLanguages.get(userId) || this.defaultLanguage;
  }

  setLanguage(userId, language) {
    this.userLanguages.set(userId, language);
  }

  hasLanguage(userId) {
    return this.userLanguages.has(userId);
  }
}

export const userLanguageManager = new UserLanguageManager();