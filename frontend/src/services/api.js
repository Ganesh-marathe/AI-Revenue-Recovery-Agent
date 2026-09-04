const API_URL = "http://127.0.0.1:8000";

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem("reviveai_token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("reviveai_token");
    localStorage.removeItem("reviveai_user");

    window.location.reload();

    throw new Error(
      "Session expired. Please login again."
    );
  }

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
}


/* =========================
   DASHBOARD
========================= */

export async function getDashboardSummary() {
  return fetchAPI("/api/analytics/summary");
}


/* =========================
   REVENUE RISK
========================= */

export async function getRevenueRisk() {
  return fetchAPI("/api/analytics/revenue-risk");
}


/* =========================
   RECOVERY STATUS
========================= */

export async function getRecoveryStatus() {
  return fetchAPI("/api/recovery/status");
}


/* =========================
   CUSTOMERS
========================= */

export async function getCustomers() {
  return fetchAPI("/api/customers/");
}


/* =========================
   AUDIT LOGS
========================= */

export async function getAuditLogs() {
  return fetchAPI("/api/recovery/audit-logs");
}


/* =========================
   RECOVERY ANALYSIS
========================= */

export async function analyzeRecovery(invoiceId) {
  return fetchAPI(
    `/api/recovery/analyze/${invoiceId}`
  );
}


/* =========================
   EXECUTE RECOVERY ACTION
========================= */

export async function executeRecoveryAction(caseId) {
  return fetchAPI(
    `/api/recovery/cases/${caseId}/execute`,
    {
      method: "POST",
    }
  );
}


/* =========================
   CURRENT USER
========================= */

export async function getCurrentUser() {
  return fetchAPI("/api/auth/me");
}


/* =========================
   INVOICE LIST
========================= */

export async function getInvoices() {
  return fetchAPI("/api/invoices/");
}


/* =========================
   SINGLE INVOICE
========================= */

export async function getInvoice(invoiceId) {
  return fetchAPI(
    `/api/invoices/${invoiceId}`
  );
}


/* =========================
   PAYMENT LIST
========================= */

export async function getPayments() {
  return fetchAPI("/api/payments/");
}


/* =========================
   SINGLE PAYMENT
========================= */

export async function getPayment(paymentId) {
  return fetchAPI(
    `/api/payments/${paymentId}`
  );
}


/* =========================
   INVOICE PAYMENT HISTORY
========================= */

export async function getInvoicePayments(invoiceId) {
  return fetchAPI(
    `/api/payments/invoice/${invoiceId}`
  );
}