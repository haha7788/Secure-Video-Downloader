class RateLimiter {
  constructor(cooldownMs = 1500) {
    this.userLastAction = new Map();
    this.cooldownMs = cooldownMs;
  }

  canPerform(userId) {
    const now = Date.now();
    const lastAction = this.userLastAction.get(userId);

    if (!lastAction || now - lastAction >= this.cooldownMs) {
      this.userLastAction.set(userId, now);
      return true;
    }

    return false;
  }

  getRemainingCooldown(userId) {
    const now = Date.now();
    const lastAction = this.userLastAction.get(userId);

    if (!lastAction) return 0;

    const remaining = this.cooldownMs - (now - lastAction);
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  clearCooldown(userId) {
    this.userLastAction.delete(userId);
  }
}

export const rateLimiter = new RateLimiter(1500);