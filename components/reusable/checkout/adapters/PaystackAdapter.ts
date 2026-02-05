import { PaymentAdapter, PaymentIntent, PaymentResult } from './PaymentAdapter.interface';
import { initializePaystack, loadPaystackScript, generateReference, PaystackConfig } from '@/lib/paystack';

export interface PaystackAdapterConfig {
  publicKey: string;
}

export class PaystackAdapter implements PaymentAdapter {
  private config: PaystackAdapterConfig;
  private currentConfig: PaystackConfig | null = null;

  constructor(config: PaystackAdapterConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    await loadPaystackScript();
  }

  async createPayment(amount: number, email: string, metadata: any): Promise<PaymentIntent> {
    const reference = generateReference();
    
    // We store the config to be used in handleCallback/execution
    // Note: initializePaystack in lib calls setup().openIframe() immediately.
    // In this adapter pattern, we might want to split setup and open, 
    // but the library helper does both.
    // We will mimic "creating an intent" by just returning the ref and data needed.
    
    return {
      reference,
      amount,
      currency: 'ZAR',
      metadata
    };
  }

  async handleCallback(callbacks: { onSuccess: (reference: string) => void; onClose: () => void; }): Promise<PaymentResult> {
     // This method implementation assumes 'createPayment' was called and we are now triggering the UI
     // But wait, the Paystack inline JS requires us to pass the callback functions AT SETUP time.
     // So we can't easily decouple "create intent" and "handle callback" in the standard flow if we use the helper 'initializePaystack'.
     // We will need to re-structure how we call it.
     
     // Actually, let's change how we use it. 
     // The DynamicCheckout will call adapter.executePayment(intent, callbacks)
     return new Promise((resolve) => {
         // This is a bit awkward because initializePaystack takes everything at once.
         // We will add an 'executePayment' method or overload handleCallback.
         resolve({ success: false, error: 'Use executePayment instead' });
     });
  }
  
  // Custom method for Paystack Inline flow
  async executePayment(intent: PaymentIntent, email: string, callbacks: { onSuccess: (reference: string) => void; onClose: () => void; }) {
      return new Promise((resolve) => {
          initializePaystack({
              key: this.config.publicKey,
              email: email,
              amount: intent.amount, // API expects units (Rands), helper converts to cents
              reference: intent.reference,
              currency: intent.currency,
              metadata: intent.metadata,
              onSuccess: (response: any) => {
                  callbacks.onSuccess(response.reference);
                  resolve({ success: true, reference: response.reference });
              },
              onClose: () => {
                  callbacks.onClose();
                  resolve({ success: false });
              }
          });
      });
  }
}
