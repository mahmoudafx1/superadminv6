import api from "./api";

export const getServicesByStatus = (status = "PENDING_APPROVAL", branchId) =>
  api.get("/admin/services", {
    params: {
      status,
      branch_id: branchId,
    },
  });

export const approveService = (id) =>
  api.patch(`/admin/services/${id}/approve`, {});

export const rejectService = (id, reason = "No specific reason") =>
  api.patch(`/admin/services/${id}/reject`, { reason });

export const getServiceById = (id) =>
  api.get(`/admin/services/${id}`);