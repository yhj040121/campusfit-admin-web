import http from "./http";

export function loginAdmin(payload) {
  return http.post("/api/admin/auth/login", payload);
}

export function fetchAdminProfile() {
  return http.get("/api/admin/auth/me");
}

export function logoutAdmin() {
  return http.post("/api/admin/auth/logout");
}

export function getDashboardSummary() {
  return http.get("/api/admin/dashboard/summary");
}

export function getAdminUsers() {
  return http.get("/api/admin/users");
}

export function freezeAdminUser(userId) {
  return http.post(`/api/admin/users/${userId}/freeze`);
}

export function unfreezeAdminUser(userId) {
  return http.post(`/api/admin/users/${userId}/unfreeze`);
}

export function getAdminContentAudit() {
  return http.get("/api/admin/content-audit");
}

export function approveAdminPost(postId) {
  return http.post(`/api/admin/content-audit/${postId}/approve`);
}

export function rejectAdminPost(postId) {
  return http.post(`/api/admin/content-audit/${postId}/reject`);
}

export function getAdminMerchants() {
  return http.get("/api/admin/merchants");
}

export function getAdminSettlements() {
  return http.get("/api/admin/settlements");
}

export function confirmAdminSettlement(recordId) {
  return http.post(`/api/admin/settlements/${recordId}/confirm`);
}

export function getAdminWithdrawRequests() {
  return http.get("/api/admin/withdraw-requests");
}

export function approveAdminWithdrawRequest(requestId) {
  return http.post(`/api/admin/withdraw-requests/${requestId}/approve`);
}

export function rejectAdminWithdrawRequest(requestId) {
  return http.post(`/api/admin/withdraw-requests/${requestId}/reject`);
}
