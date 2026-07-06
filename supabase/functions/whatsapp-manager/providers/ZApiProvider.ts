import { IWhatsAppProvider } from "../types.ts";

export class ZApiProvider implements IWhatsAppProvider {
  // Configured in Supabase Environment Variables
  private clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN") || "";

  /**
   * For the MVP, if we don't have the Partner API to create instances dynamically via Client Token,
   * we will use a pre-existing Instance for testing/MVP, or you can implement the real Partner API call here.
   * Assuming we use a pre-configured instance for the MVP:
   */
  async createInstance(ownerId: string): Promise<{ instanceId: string; qrCode: string; token: string }> {
    // In a real white-label SaaS, you'd call Z-API's Partner API to create a new instance here.
    // For MVP, we use the ENV variables set up in Supabase.
    const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
    const token = Deno.env.get("ZAPI_INSTANCE_TOKEN");

    if (!instanceId || !token) {
      throw new Error("ZAPI_INSTANCE_ID or ZAPI_INSTANCE_TOKEN not configured");
    }

    // Call Z-API to get QR Code
    const response = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/qr-code/image`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Client-Token": this.clientToken
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch QR Code from Z-API: ${response.status}`);
    }

    const data = await response.json();
    return {
      instanceId,
      token,
      qrCode: data.value // Base64 image
    };
  }

  async getInstanceStatus(instanceId: string, token: string): Promise<{ connected: boolean; phone?: string }> {
    const response = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/status`, {
      method: "GET",
      headers: {
        "Client-Token": this.clientToken
      }
    });
    
    if (!response.ok) {
      return { connected: false };
    }

    const data = await response.json();
    const connected = data.connected === true;
    let phone;

    if (connected) {
      // Fetch phone number using the correct Z-API device endpoint
      const phoneResponse = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/device`, {
        method: "GET",
        headers: {
          "Client-Token": this.clientToken
        }
      });
      if (phoneResponse.ok) {
        const phoneData = await phoneResponse.json();
        phone = phoneData.phone || phoneData.connectedPhone;
      }
    }

    return { connected, phone };
  }

  async disconnectInstance(instanceId: string, token: string): Promise<boolean> {
    const response = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/disconnect`, {
      method: "GET",
      headers: {
        "Client-Token": this.clientToken
      }
    });
    return response.ok;
  }
}
