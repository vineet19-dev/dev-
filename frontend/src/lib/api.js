const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const parse = async (response) => {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Request failed");
  }
  return response.json();
};

export const fetchSnapshot = async () => {
  const response = await fetch(`${API_BASE}/snapshot`);
  return parse(response);
};

export const resolveAlert = async (id) => {
  const response = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
    method: "PATCH"
  });
  return parse(response);
};

export const triggerSimulation = async (type) => {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type })
  });
  return parse(response);
};

export const createManualAlert = async (payload) => {
  const response = await fetch(`${API_BASE}/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parse(response);
};

export const resetSystem = async () => {
  const response = await fetch(`${API_BASE}/reset`, {
    method: "POST"
  });
  return parse(response);
};