// Steadfast Courier API Integration
// Docs: https://steadfast.com.bd/user/api-doc

const STEADFAST_BASE_URL = "https://portal.steadfast.com.bd/api/v1";

interface SteadfastCredentials {
  apiKey: string;
  secretKey: string;
}

interface CreateOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

interface SteadfastResponse {
  status: number;
  message: string;
  consignment?: {
    consignment_id: number;
    invoice: string;
    tracking_code: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: string;
    created_at: string;
  };
}

function getCredentials(): SteadfastCredentials | null {
  const apiKey = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;
  if (!apiKey || !secretKey) return null;
  return { apiKey, secretKey };
}

export function hasSteadfastConfig(): boolean {
  return getCredentials() !== null;
}

export async function createSteadfastOrder(
  payload: CreateOrderPayload
): Promise<{ success: boolean; data?: SteadfastResponse; error?: string }> {
  const creds = getCredentials();
  if (!creds) {
    return { success: false, error: "Steadfast API credentials not configured" };
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as SteadfastResponse;

    if (res.ok && data.status === 200) {
      return { success: true, data };
    }

    return { success: false, error: data.message || "Failed to create Steadfast order" };
  } catch (error) {
    console.error("Steadfast error:", error);
    return { success: false, error: "Network error connecting to Steadfast" };
  }
}

export async function checkSteadfastStatus(
  trackingCode: string
): Promise<{ success: boolean; status?: string; error?: string }> {
  const creds = getCredentials();
  if (!creds) {
    return { success: false, error: "Steadfast API credentials not configured" };
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/status_by_trackingcode/${trackingCode}`, {
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
      },
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, status: data.delivery_status };
    }
    return { success: false, error: "Failed to check status" };
  } catch {
    return { success: false, error: "Network error" };
  }
}
