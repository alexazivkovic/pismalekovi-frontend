export const setAuth = (user, pass) => sessionStorage.setItem("auth", btoa(`${user}:${pass}`));
export const getAuth = () => sessionStorage.getItem("auth") || null;
export const clearAuth = () => sessionStorage.removeItem("auth");
export const authHeader = () => {
  const a = getAuth();
  return a ? { Authorization: `Basic ${a}` } : {};
};
