import api from "./api";

export const getApplicationById = (id) =>
   api.get(`/admin/branches/${id}`);

export const approveApplication = (id) =>
   api.patch(`admin/branches/${id}/approve`, {});

export const rejectApplication = (id, reason) =>
   api.patch(`admin/branches/${id}/reject`, { reason: reason });

export const toggleBlockBranch = (id) =>
   api.patch(`/admin/branches/${id}/toggle-block`, {});

export const getApplications = (status) =>
   api.get("/admin/branches", {
      params: {
         status: status,
      },
   });

export const getApprovedApplications = (category) =>
   api.get("/admin/branches", {
      params: {
         status: "APPROVED",
         category,
      },
   });
export const getPendingApprovalApplications = (category) =>
   api.get("/admin/branches", {
      params: {
         status: "PENDING_APPROVAL",
         category,
      },
   });