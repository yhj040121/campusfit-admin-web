export const ADMIN_TOKEN_KEY = "campusfit_admin_token";
export const ADMIN_PROFILE_KEY = "campusfit_admin_profile";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function getAdminProfile() {
  const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function setAdminProfile(profile) {
  if (!profile) {
    localStorage.removeItem(ADMIN_PROFILE_KEY);
    return;
  }
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify({
    username: profile.username,
    roleCode: profile.roleCode,
    displayName: profile.displayName
  }));
}

export function setAdminSession(payload) {
  if (!payload) {
    return;
  }
  localStorage.setItem(ADMIN_TOKEN_KEY, payload.token || "");
  setAdminProfile(payload);
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
}

export function hasAnyRole(roleCodes) {
  if (!roleCodes || !roleCodes.length) {
    return true;
  }
  const profile = getAdminProfile();
  if (!profile?.roleCode) {
    return false;
  }
  return roleCodes.includes(profile.roleCode);
}