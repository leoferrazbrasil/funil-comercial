import { IWhatsAppProvider } from "../types.ts";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ZApiProvider implements IWhatsAppProvider {
  // Configured in Supabase Environment Variables
  private clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN") || "";

  private baseUrl(instanceId: string, token: string) {
    return `https://api.z-api.io/instances/${instanceId}/token/${token}`;
  }

  private headers() {
    return {
      "Accept": "application/json",
      "Client-Token": this.clientToken,
    };
  }

  private async ensureCleanState(instanceId: string, token: string): Promise<void> {
    const base = this.baseUrl(instanceId, token);

    try {
      console.log("[ZApiProvider] Disconnecting and restoring session for a completely fresh state...");

      // Force disconnect first to be safe
      await fetch(`${base}/disconnect`, { headers: this.headers() });
      await sleep(2000);

      // Restore session forces a hard restart of the WhatsApp Web browser process
      await fetch(`${base}/restore-session`, {
        method: "POST",
        headers: this.headers(),
      });

      // Wait 15 seconds to ensure the browser is fully booted and ready.
      // Increased from 10s to 15s because Z-API needs time to:
      // 1. Spin up a new browser instance
      // 2. Load WhatsApp Web
      // 3. Establish initial connection
      // If we ask for QR code too soon, Z-API returns a phantom/broken QR code.
      await sleep(15000);
    } catch (e) {
      console.warn("[ZApiProvider] Error during ensureCleanState:", e);
    }
  }

  async createInstance(ownerId: string): Promise<{ instanceId: string; qrCode: string; token: string }> {
    const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
    const token = Deno.env.get("ZAPI_INSTANCE_TOKEN");

    if (!instanceId || !token) {
      throw new Error("ZAPI_INSTANCE_ID or ZAPI_INSTANCE_TOKEN not configured");
    }

    const base = this.baseUrl(instanceId, token);

    // Ensure the instance is in a clean state before requesting QR Code
    await this.ensureCleanState(instanceId, token);

    // Attempt to get QR Code with retry
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[ZApiProvider] Requesting QR Code (attempt ${attempt}/${maxAttempts})...`);

      const response = await fetch(`${base}/qr-code/image`, {
        method: "GET",
        headers: this.headers(),
      });

      if (!response.ok) {
        console.error(`[ZApiProvider] QR Code request failed: HTTP ${response.status}`);
        if (attempt === maxAttempts) {
          throw new Error(`Z-API não retornou o QR Code após ${maxAttempts} tentativas (HTTP ${response.status}).`);
        }
        await sleep(3000);
        continue;
      }

      const data = await response.json();
      console.log("[ZApiProvider] QR Code response keys:", Object.keys(data));

      if (data.value) {
        console.log("[ZApiProvider] QR Code generated successfully.");
        return { instanceId, token, qrCode: data.value };
      }

      // value is null/empty — instance might still be processing disconnect
      console.warn(`[ZApiProvider] QR Code value is empty on attempt ${attempt}. Waiting before retry...`);
      if (attempt < maxAttempts) {
        await sleep(4000);
      }
    }

    throw new Error("A instância do WhatsApp ainda está sendo preparada. Aguarde alguns segundos e tente novamente.");
  }

  async getInstanceStatus(instanceId: string, token: string): Promise<{ connected: boolean; phone?: string }> {
    const base = this.baseUrl(instanceId, token);

    try {
      const response = await fetch(`${base}/status`, {
        method: "GET",
        headers: this.headers(),
        signal: AbortSignal.timeout(15000), // 15 second timeout per API call
      });

      if (!response.ok) {
        console.warn(`[ZApiProvider] Status check failed: HTTP ${response.status}`);
        return { connected: false };
      }

      const data = await response.json();
      const connected = data.connected === true;
      let phone;

      if (connected) {
        // Fetch phone number using the correct Z-API device endpoint
        const phoneResponse = await fetch(`${base}/device`, {
          method: "GET",
          headers: this.headers(),
          signal: AbortSignal.timeout(10000), // 10 second timeout for device info
        });
        if (phoneResponse.ok) {
          const phoneData = await phoneResponse.json();
          phone = phoneData.phone || phoneData.connectedPhone;
        }
      }

      return { connected, phone };
    } catch (error) {
      console.error(`[ZApiProvider] Error checking instance status:`, error);
      return { connected: false };
    }
  }

  async disconnectInstance(instanceId: string, token: string): Promise<boolean> {
    const base = this.baseUrl(instanceId, token);
    console.log("[ZApiProvider] Disconnecting instance:", instanceId);

    const response = await fetch(`${base}/disconnect`, {
      method: "GET",
      headers: this.headers(),
    });

    console.log("[ZApiProvider] Disconnect response status:", response.status);
    return response.ok;
  }
}
