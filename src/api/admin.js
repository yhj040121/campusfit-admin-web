import http from "./http";

export function loginAdmin(payload) {
  return http.post("/admin/auth/login", payload);
}

export function fetchAdminProfile() {
  return http.get("/admin/auth/me");
}

export function logoutAdmin() {
  return http.post("/admin/auth/logout");
}

export function getDashboardSummary() {
  return http.get("/admin/dashboard/summary");
}

export function getAdminUsers() {
  return http.get("/admin/users");
}

export function freezeAdminUser(userId) {
  return http.post(`/admin/users/${userId}/freeze`);
}

export function unfreezeAdminUser(userId) {
  return http.post(`/admin/users/${userId}/unfreeze`);
}

export function getAdminContentAudit() {
  return http.get("/admin/content-audit");
}

export function approveAdminPost(postId) {
  return http.post(`/admin/content-audit/${postId}/approve`);
}

export function rejectAdminPost(postId) {
  return http.post(`/admin/content-audit/${postId}/reject`);
}

export function getAdminAnnouncements() {
  return http.get("/admin/announcements");
}

export function createAdminAnnouncement(payload) {
  return http.post("/admin/announcements", payload);
}

export function updateAdminAnnouncement(announcementId, payload) {
  return http.put(`/admin/announcements/${announcementId}`, payload);
}

export function enableAdminAnnouncement(announcementId) {
  return http.post(`/admin/announcements/${announcementId}/enable`);
}

export function disableAdminAnnouncement(announcementId) {
  return http.post(`/admin/announcements/${announcementId}/disable`);
}

export function getAdminActivities() {
  return http.get("/admin/activities");
}

export function createAdminActivity(payload) {
  return http.post("/admin/activities", payload);
}

export function updateAdminActivity(activityId, payload) {
  return http.put(`/admin/activities/${activityId}`, payload);
}

export function startAdminActivity(activityId) {
  return http.post(`/admin/activities/${activityId}/start`);
}

export function stopAdminActivity(activityId) {
  return http.post(`/admin/activities/${activityId}/stop`);
}

export function getAdminMerchants() {
  return http.get("/admin/merchants");
}

export function getAdminSettlements() {
  return http.get("/admin/settlements");
}

export function confirmAdminSettlement(recordId) {
  return http.post(`/admin/settlements/${recordId}/confirm`);
}

export function getAdminWithdrawRequests() {
  return http.get("/admin/withdraw-requests");
}

export function approveAdminWithdrawRequest(requestId) {
  return http.post(`/admin/withdraw-requests/${requestId}/approve`);
}

export function rejectAdminWithdrawRequest(requestId) {
  return http.post(`/admin/withdraw-requests/${requestId}/reject`);
}
