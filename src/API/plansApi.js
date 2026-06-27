import api from "./api";

export const getPlans = () => api.get("/plans");