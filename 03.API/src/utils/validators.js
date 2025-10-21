// Simple validators used by controllers. Keep minimal and dependency-free.

function isValidPassword(pw) {
  if (typeof pw !== 'string') return false;
  if (pw.length < 10) return false;
  if (!/[0-9]/.test(pw)) return false;
  if (!/[A-Za-z]/.test(pw)) return false;
  return true;
}

function isGmail(email) {
  if (typeof email !== 'string') return false;
  // simple check: ends with @gmail.com (case-insensitive)
  return /@gmail\.com$/i.test(email.trim());
}

function isPhone10(phone) {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  // accept 10-digit numbers (local format) or 11 with leading country 0
  return digits.length === 10 || digits.length === 11;
}

module.exports = { isValidPassword, isGmail, isPhone10 };
