export function getToken() {
  return localStorage.getItem('token');
}

export function parseJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(payloadB64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function getUserFromToken(token) {
  return parseJwt(token || getToken()) || null;
}

export function isAuthenticated() {
  const payload = getUserFromToken();
  if (!payload) return false;
  if (payload.exp && typeof payload.exp === 'number') {
    return payload.exp > Math.floor(Date.now() / 1000);
  }
  return true;
}

export function logoutLocal() {
  localStorage.removeItem('token');
}