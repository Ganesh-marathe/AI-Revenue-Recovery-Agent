const API_URL = "http://127.0.0.1:8000";

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function getDashboardSummary() {
  return fetchAPI("/api/analytics/summary");
}

export async function getRevenueRisk() {
  return fetchAPI("/api/analytics/revenue-risk");
}
export async function getRecoveryStatus() {
  return fetchAPI("/api/recovery/status");
}

export async function getAuditLogs() {
  return fetchAPI("/api/recovery/audit-logs");
} 
export async function getCustomers() {
  return fetchAPI("/api/customers/");
}

export async function getInvoices() {
  return fetchAPI("/api/invoices/");
}

export async function getPayments() {
  return fetchAPI("/api/payments/");
}
