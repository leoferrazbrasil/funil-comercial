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
      
      // Wait 10 seconds to ensure the browser is fully booted before we ask for the QR code.
      // This is necessary because if we ask too soon, Z-API might give us a phantom/broken QR code.
      await sleep(10000);
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

    const response = await fetch(`${base}/status`, {
      method: "GET",
      headers: this.headers(),
    });
    
    if (!response.ok) {
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
      });
      if (phoneResponse.ok) {
        const phoneData = await phoneResponse.json();
        phone = phoneData.phone || phoneData.connectedPhone;
      }
    }

    return { connected, phone };
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
