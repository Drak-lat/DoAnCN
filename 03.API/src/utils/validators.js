function isValidPassword(pw) {
  if (!pw) return false;
  if (pw.length < 10) return false; // SỬA: < thay vì <=
  const hasLetter = /[A-Za-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  return hasLetter && hasNumber;
}

function isGmail(email) {
  if (!email) return false;
  return /^[^\s@]+@gmail\.com$/i.test(email);
}

// Số điện thoại phải đủ 10 số và bắt đầu bằng số 0
function isPhone10(phone) {
  if (!phone) return false;
  return /^0\d{9}$/.test(phone); // Bắt đầu bằng 0 và theo sau là 9 chữ số
}

module.exports = { isValidPassword, isGmail, isPhone10 };