import api from "./api";

export const getRecentActivities = () =>
  api.get("/admin/analytics/recent-activities");

export const getAnalyticsOverview  = () =>
  api.get("/admin/analytics/overview");

export const  getRevenueChart = () =>
  api.get("/admin/analytics/revenue-chart");