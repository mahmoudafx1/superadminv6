import api from "./api";

export const getPlatformAnalytics = (value = "this_year") =>
  api.get("/admin/analytics/platform", {
    params: { period: value },
  });

export const getBranchPayments = (
  period = "this_year",
  page = 1
) =>
  api.get("/admin/payments", {
    params: {
      period,
      page,
    },
  });

export const getPaymentDetails = (paymentId) =>
  api.get(`/admin/payments/${paymentId}`);

export const refundPayment = (paymentId) =>
  api.post(`/admin/payments/${paymentId}/refund`);

export const getFinancialSummary = () =>
  api.get("/admin/financial/summary");