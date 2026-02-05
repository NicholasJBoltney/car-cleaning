export interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // in base units (e.g. Rand, not cents - we convert to cents below)
  currency?: string;
  reference: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

export const initializePaystack = (config: PaystackConfig) => {
  if (typeof window === 'undefined') return;

  const handler = (window as any).PaystackPop.setup({
    key: config.key,
    email: config.email,
    amount: Math.round(config.amount * 100), // Convert to cents/kobo
    currency: config.currency || 'ZAR',
    ref: config.reference,
    metadata: config.metadata || {},
    callback: (response: any) => {
      config.onSuccess(response);
    },
    onClose: () => {
      config.onClose();
    },
  });

  handler.openIframe();
};

export const generateReference = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `BCP-${timestamp}-${random}`;
};

export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is undefined'));
      return;
    }

    if ((window as any).PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
};

export const verifyPayment = async (reference: string) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error('Paystack Secret Key not found in environment');

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to verify payment with Paystack');
  }

  const data = await response.json();
  return data;
};
