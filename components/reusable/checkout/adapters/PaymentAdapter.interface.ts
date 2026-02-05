export interface PaymentIntent {
  reference: string;
  amount: number;
  currency: string;
  metadata?: any;
}

export interface PaymentResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export interface PaymentAdapter {
  initialize(): Promise<void>;
  createPayment(amount: number, email: string, metadata: any): Promise<PaymentIntent>;
  handleCallback(callbacks: {
    onSuccess: (reference: string) => void;
    onClose: () => void;
  }): Promise<PaymentResult>;
  // verifyPayment is usually server-side, but might be needed here if adapter handles verification logic
}
