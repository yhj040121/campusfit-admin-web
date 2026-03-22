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

export function getAdminAnnouncements() {
  return http.get("/api/admin/announcements");
}

export function createAdminAnnouncement(payload) {
  return http.post("/api/admin/announcements", payload);
}

export function updateAdminAnnouncement(announcementId, payload) {
  return http.put(`/api/admin/announcements/${announcementId}`, payload);
}

export function enableAdminAnnouncement(announcementId) {
  return http.post(`/api/admin/announcements/${announcementId}/enable`);
}

export function disableAdminAnnouncement(announcementId) {
  return http.post(`/api/admin/announcements/${announcementId}/disable`);
}

export function getAdminActivities() {
  return http.get("/api/admin/activities");
}

export function createAdminActivity(payload) {
  return http.post("/api/admin/activities", payload);
}

export function updateAdminActivity(activityId, payload) {
  return http.put(`/api/admin/activities/${activityId}`, payload);
}

export function startAdminActivity(activityId) {
  return http.post(`/api/admin/activities/${activityId}/start`);
}

export function stopAdminActivity(activityId) {
  return http.post(`/api/admin/activities/${activityId}/stop`);
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
