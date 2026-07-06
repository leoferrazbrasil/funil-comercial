export interface IWhatsAppProvider {
  /**
   * Initialize a new instance or retrieve an existing one
   */
  createInstance(ownerId: string): Promise<{ instanceId: string; qrCode: string; token: string }>;
  
  /**
   * Check connection status
   */
  getInstanceStatus(instanceId: string, token: string): Promise<{ connected: boolean; phone?: string }>;
  
  /**
   * Disconnect an instance
   */
  disconnectInstance(instanceId: string, token: string): Promise<boolean>;
}
