import { RepositoryData, FileNode, HotspotItem, DeadCodeItem, DuplicateCodeItem, CodebaseMetrics } from '../types/repository';
import { APP_CONFIG } from '../config/constants';

export const mockShopFlowHotspots: HotspotItem[] = [
  {
    id: 'hot_1',
    file: 'server/routes/checkout.ts',
    functionName: 'createPaymentIntentHandler',
    cyclomaticComplexity: 14,
    changeFrequencyScore: 92,
    linesOfCode: 52,
    riskScore: 92,
    reason: 'High change velocity combined with multi-branch stock reservation and pricing logic creates elevated regression risk.',
  },
  {
    id: 'hot_2',
    file: 'src/pages/Checkout.tsx',
    functionName: 'handleProcessPayment',
    cyclomaticComplexity: 11,
    changeFrequencyScore: 84,
    linesOfCode: 48,
    riskScore: 78,
    reason: 'Multi-step async payment authorization with address validation and UI state dispatching.',
  },
  {
    id: 'hot_3',
    file: 'server/services/inventoryService.ts',
    functionName: 'reserveStock',
    cyclomaticComplexity: 9,
    changeFrequencyScore: 76,
    linesOfCode: 36,
    riskScore: 72,
    reason: 'Pessimistic transaction block with iterative row locking prone to race condition bottlenecks.',
  }
];

export const mockShopFlowDeadCode: DeadCodeItem[] = [
  {
    id: 'dead_1',
    file: 'src/services/apiClient.ts',
    symbolName: 'legacyAuthTokenFormatter',
    kind: 'function',
    line: 38,
    confidence: 96,
    estimatedSavingLines: 14,
    suggestion: 'Function was deprecated in v2.1 when switching to OAuth Bearer headers; no incoming callers found in AST graph.',
  },
  {
    id: 'dead_2',
    file: 'server/routes/products.ts',
    symbolName: 'rawSqlCategoryJoin',
    kind: 'function',
    line: 54,
    confidence: 91,
    estimatedSavingLines: 22,
    suggestion: 'Unused raw SQL query string superseded by Prisma ORM relation fetching.',
  }
];

export const mockShopFlowDuplicateCode: DuplicateCodeItem[] = [
  {
    id: 'dup_1',
    title: 'Stripe Address Parameter Formatting Block',
    similarityPercentage: 92,
    linesCount: 16,
    instances: [
      {
        file: 'src/pages/Checkout.tsx',
        lineStart: 52,
        lineEnd: 68,
        snippet: `{ line1: shippingAddress.street, city: shippingAddress.city, postal_code: shippingAddress.postalCode, country: shippingAddress.country }`
      },
      {
        file: 'src/hooks/usePayment.ts',
        lineStart: 34,
        lineEnd: 50,
        snippet: `{ line1: billingDetails.address.street, city: billingDetails.address.city, postal_code: billingDetails.address.postalCode, country: billingDetails.address.country }`
      }
    ],
    refactoringSuggestion: 'Extract into shared `formatStripeAddress(address: Address)` utility in `src/utils/stripeAdapter.ts`.',
  }
];

export const mockShopFlowMetrics: CodebaseMetrics = {
  totalLOC: 4820,
  cyclomaticComplexityAvg: 3.4,
  maintainabilityIndex: 84,
  technicalDebtRatioPercent: 4.2,
  duplicatedCodePercent: 2.8,
  testCoveragePercent: 84.5,
  documentedSymbolsPercent: 76.0,
};

export const mockShopFlowFiles: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    path: 'src',
    type: 'directory',
    isOpen: true,
    children: [
      {
        id: 'src-pages',
        name: 'pages',
        path: 'src/pages',
        type: 'directory',
        isOpen: true,
        children: [
          {
            id: 'src-pages-checkout',
            name: 'Checkout.tsx',
            path: 'src/pages/Checkout.tsx',
            type: 'file',
            language: 'typescript',
            size: 3420,
            symbols: [
              { name: 'CheckoutPage', kind: 'function', line: 18, exported: true, signature: 'export const CheckoutPage: React.FC' },
              { name: 'handleProcessPayment', kind: 'function', line: 45, signature: 'const handleProcessPayment = async (token: string): Promise<void>' },
              { name: 'validateShippingAddress', kind: 'function', line: 78, signature: 'const validateShippingAddress = (addr: Address): boolean' }
            ],
            content: `import React, { useState, useEffect } from 'react';
import { usePayment } from '../hooks/usePayment';
import { CartSummary } from '../components/CartSummary';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react';

export interface Address {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { createPaymentIntent, confirmPayment, isProcessing, error: paymentError } = usePayment();
  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullName: user?.name || '',
    street: '',
    city: '',
    postalCode: '',
    country: 'US',
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Stripe payment intent on cart load
    const initIntent = async () => {
      try {
        const res = await apiClient.post('/api/checkout/create-intent', {
          currency: 'usd',
          items: [{ id: 'prod_991', quantity: 2 }, { id: 'prod_442', quantity: 1 }],
        });
        setClientSecret(res.data.clientSecret);
      } catch (err: any) {
        setFormError('Failed to initialize secure checkout session.');
      }
    };
    initIntent();
  }, []);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShippingAddress(shippingAddress)) {
      setFormError('Please complete all required shipping fields.');
      return;
    }
    setFormError(null);

    try {
      if (!clientSecret) throw new Error('Missing payment intent secret');
      const result = await confirmPayment({
        clientSecret,
        billingDetails: {
          name: shippingAddress.fullName,
          address: shippingAddress,
        },
      });

      if (result.success) {
        setPaymentSuccess(true);
      }
    } catch (err: any) {
      setFormError(err.message || 'Payment processing failed.');
    }
  };

  const validateShippingAddress = (addr: Address): boolean => {
    return Boolean(
      addr.fullName.trim() &&
      addr.street.trim() &&
      addr.city.trim() &&
      addr.postalCode.trim()
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-4 h-4 text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-100">Secure Checkout</h2>
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            SSL 256-Bit
          </span>
        </div>

        {formError && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleProcessPayment} className="space-y-5">
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">1. Shipping Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Street Address"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
              />
              <input
                type="text"
                placeholder="City"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="Postal / ZIP Code"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">2. Payment Gateway</h3>
            <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-slate-200">Stripe Elements V3</span>
              </div>
              <span className="text-[11px] text-indigo-400 font-mono">
                {clientSecret ? clientSecret.slice(0, 16) + '...' : 'Loading...'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !clientSecret}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Authorizing Transaction...
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> Complete Purchase ($248.50 USD)
              </>
            )}
          </button>
        </form>
      </div>

      <div className="lg:col-span-5">
        <CartSummary />
      </div>
    </div>
  );
};
`
          },
          {
            id: 'src-pages-products',
            name: 'Products.tsx',
            path: 'src/pages/Products.tsx',
            type: 'file',
            language: 'typescript',
            size: 2100,
            symbols: [
              { name: 'ProductsPage', kind: 'function', line: 12, exported: true }
            ],
            content: `import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { Product } from '../types';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const { data } = await apiClient.get('/api/products?limit=20');
        setProducts(data.items);
      } catch (e) {
        console.error('Catalog fetch failure', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-white mb-6">Storefront Catalog</h1>
      {loading ? (
        <div className="text-slate-400 text-xs font-mono">Loading catalog items...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          {products.map(p => (
            <div key={p.id} className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <h3 className="font-semibold text-slate-100">{p.title}</h3>
              <p className="text-slate-400 mt-1">{p.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-indigo-400">\${p.price.toFixed(2)}</span>
                <button className="px-2.5 py-1 bg-indigo-600 rounded text-xs text-white">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
`
          }
        ]
      },
      {
        id: 'src-components',
        name: 'components',
        path: 'src/components',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'src-components-cartsummary',
            name: 'CartSummary.tsx',
            path: 'src/components/CartSummary.tsx',
            type: 'file',
            language: 'typescript',
            size: 1950,
            symbols: [
              { name: 'CartSummary', kind: 'function', line: 10, exported: true }
            ],
            content: `import React from 'react';
import { ShoppingBag } from 'lucide-react';

export const CartSummary: React.FC = () => {
  const items = [
    { id: 'prod_991', name: 'Ergonomic Developer Chair Pro', price: 189.00, qty: 1 },
    { id: 'prod_442', name: 'USB-C Magnetic Braided Cable (2m)', price: 29.75, qty: 2 },
  ];

  const subtotal = items.reduce((acc, it) => acc + (it.price * it.qty), 0);
  const tax = subtotal * 0.0825;
  const shipping = 0.00;
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-xl text-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#30363d]">
        <ShoppingBag className="w-4 h-4 text-indigo-400" />
        <h3 className="font-semibold text-slate-100">Order Summary ({items.length} items)</h3>
      </div>

      <div className="space-y-3 mb-5">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div>
              <div className="font-medium text-slate-200">{item.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">Qty: {item.qty} × \${item.price.toFixed(2)}</div>
            </div>
            <div className="font-mono text-slate-200">\${(item.price * item.qty).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-3 border-t border-[#30363d]">
        <div className="flex justify-between text-slate-400 font-mono">
          <span>Subtotal</span>
          <span className="text-slate-300">\${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-400 font-mono">
          <span>Estimated Sales Tax (8.25%)</span>
          <span className="text-slate-300">\${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-400 font-mono">
          <span>Standard Shipping</span>
          <span className="text-emerald-400">FREE</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-slate-100 pt-2 border-t border-[#30363d]">
          <span>Total</span>
          <span className="font-mono text-indigo-400">\${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
`
          }
        ]
      },
      {
        id: 'src-hooks',
        name: 'hooks',
        path: 'src/hooks',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'src-hooks-usepayment',
            name: 'usePayment.ts',
            path: 'src/hooks/usePayment.ts',
            type: 'file',
            language: 'typescript',
            size: 2150,
            symbols: [
              { name: 'usePayment', kind: 'function', line: 12, exported: true }
            ],
            content: `import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

interface PaymentIntentOptions {
  clientSecret: string;
  billingDetails: {
    name: string;
    address: Record<string, string>;
  };
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(async (amount: number, currency: string = 'usd') => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/checkout/create-intent', { amount, currency });
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create payment intent';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const confirmPayment = useCallback(async ({ clientSecret, billingDetails }: PaymentIntentOptions) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await apiClient.post('/api/checkout/confirm', {
        paymentIntentId: clientSecret,
        billingDetails,
      });
      return { success: true, orderId: res.data.orderId };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Card authorization was declined by issuer.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    createPaymentIntent,
    confirmPayment,
    isProcessing,
    error,
  };
}
`
          }
        ]
      },
      {
        id: 'src-services',
        name: 'services',
        path: 'src/services',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'src-services-apiclient',
            name: 'apiClient.ts',
            path: 'src/services/apiClient.ts',
            type: 'file',
            language: 'typescript',
            size: 1400,
            symbols: [
              { name: 'apiClient', kind: 'variable', line: 8, exported: true }
            ],
            content: `// Client-side API abstraction with auth interceptors
export const apiClient = {
  baseURL: import.meta.env.VITE_API_URL || '${APP_CONFIG.dev.serverUrl}',
  
  async get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  async post(endpoint: string, data?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('shopflow_jwt_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      ...(options.headers as any),
    };

    const res = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw { response: { status: res.status, data: errBody } };
    }

    const json = await res.json();
    return { data: json, status: res.status };
  }
};
`
          }
        ]
      },
      {
        id: 'src-context',
        name: 'context',
        path: 'src/context',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'src-context-auth',
            name: 'AuthContext.tsx',
            path: 'src/context/AuthContext.tsx',
            type: 'file',
            language: 'typescript',
            size: 1800,
            symbols: [
              { name: 'AuthProvider', kind: 'function', line: 16, exported: true },
              { name: 'useAuth', kind: 'function', line: 48, exported: true }
            ],
            content: `import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shopflow_user');
    return saved ? JSON.parse(saved) : { id: 'usr_dev_101', email: 'alex@shopflow.dev', name: 'Alex Rivers', role: 'CUSTOMER' };
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('shopflow_jwt_token') || 'mock_jwt_token_development_sandbox';
  });

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('shopflow_jwt_token', newToken);
    localStorage.setItem('shopflow_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shopflow_jwt_token');
    localStorage.removeItem('shopflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
`
          }
        ]
      },
      {
        id: 'src-types',
        name: 'types',
        path: 'src/types',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'src-types-index',
            name: 'index.ts',
            path: 'src/types/index.ts',
            type: 'file',
            language: 'typescript',
            size: 1100,
            symbols: [
              { name: 'Product', kind: 'interface', line: 1, exported: true },
              { name: 'Order', kind: 'interface', line: 12, exported: true },
              { name: 'PaymentStatus', kind: 'type', line: 24, exported: true }
            ],
            content: `export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  inventoryCount: number;
  category: string;
  sku: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED';
  totalAmount: number;
  stripePaymentIntentId?: string;
  items: {
    productId: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  createdAt: string;
}

export type PaymentStatus = 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
`
          }
        ]
      }
    ]
  },
  {
    id: 'server',
    name: 'server',
    path: 'server',
    type: 'directory',
    isOpen: true,
    children: [
      {
        id: 'server-index',
        name: 'index.ts',
        path: 'server/index.ts',
        type: 'file',
        language: 'typescript',
        size: 1950,
        symbols: [
          { name: 'app', kind: 'variable', line: 10, exported: true },
          { name: 'startServer', kind: 'function', line: 35 }
        ],
        content: `import express from 'express';
import cors from 'cors';
import { checkoutRouter } from './routes/checkout';
import { authRouter } from './routes/auth';
import { productsRouter } from './routes/products';
import { webhooksRouter } from './routes/webhooks';
import { rateLimiter } from './middleware/rateLimiter';
import { redisClient } from './services/redisCache';

export const app = express();
const PORT = process.env.PORT || ${APP_CONFIG.dev.serverPort};

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '${APP_CONFIG.dev.clientOrigin}', credentials: true }));

// Note: Stripe Webhooks require raw body for HMAC signature verification
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhooksRouter);

// Standard JSON parser for application routes
app.use(express.json());
app.use(rateLimiter);

// API Route Registry
app.use('/api/auth', authRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/products', productsRouter);

app.get('/health', async (req, res) => {
  const redisHealthy = await redisClient.ping().catch(() => false);
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected (PostgreSQL 16)',
      redis: redisHealthy ? 'connected' : 'degraded',
    }
  });
});

export const startServer = () => {
  return app.listen(PORT, () => {
    console.log(\`ShopFlow Backend service listening on \${APP_CONFIG.dev.serverUrl.replace('4000', '\${PORT}')}\`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
`
      },
      {
        id: 'server-routes',
        name: 'routes',
        path: 'server/routes',
        type: 'directory',
        isOpen: true,
        children: [
          {
            id: 'server-routes-checkout',
            name: 'checkout.ts',
            path: 'server/routes/checkout.ts',
            type: 'file',
            language: 'typescript',
            size: 3200,
            symbols: [
              { name: 'checkoutRouter', kind: 'variable', line: 10, exported: true },
              { name: 'createPaymentIntentHandler', kind: 'function', line: 14 },
              { name: 'confirmOrderHandler', kind: 'function', line: 55 }
            ],
            content: `import { Router, Request, Response } from 'express';
import { stripeService } from '../services/stripeService';
import { inventoryService } from '../services/inventoryService';
import { authGuard } from '../middleware/authGuard';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const checkoutRouter = Router();

// POST /api/checkout/create-intent
checkoutRouter.post('/create-intent', authGuard, async (req: Request, res: Response) => {
  try {
    const { items, currency = 'usd' } = req.body;
    const userId = (req as any).user.id;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    // 1. Calculate price securely on server to prevent client-side tampering
    let totalCents = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) {
        return res.status(404).json({ error: \`Product \${item.id} not found\` });
      }
      if (product.inventoryCount < item.quantity) {
        return res.status(400).json({ error: \`Insufficient stock for \${product.title}\` });
      }
      totalCents += Math.round(product.price * 100) * item.quantity;
    }

    // 2. Reserve inventory temporarily
    await inventoryService.reserveStock(items, userId);

    // 3. Create Stripe Payment Intent with Idempotency Key
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalCents,
      currency,
      metadata: {
        userId,
        itemCount: items.length.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalCents,
    });
  } catch (error: any) {
    console.error('Failed to create payment intent:', error);
    res.status(500).json({ error: error.message || 'Internal payment processing error' });
  }
});

// POST /api/checkout/confirm
checkoutRouter.post('/confirm', authGuard, async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, billingDetails } = req.body;
    const userId = (req as any).user.id;

    const payment = await stripeService.retrievePaymentIntent(paymentIntentId);
    if (payment.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment authorization is incomplete or failed.' });
    }

    // Create persistent Order in Postgres
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PAID',
        totalAmount: payment.amount / 100,
        stripePaymentIntentId: payment.id,
      }
    });

    res.json({ success: true, orderId: order.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`
          },
          {
            id: 'server-routes-webhooks',
            name: 'webhooks.ts',
            path: 'server/routes/webhooks.ts',
            type: 'file',
            language: 'typescript',
            size: 2800,
            symbols: [
              { name: 'webhooksRouter', kind: 'variable', line: 8, exported: true },
              { name: 'handleStripeWebhook', kind: 'function', line: 12 }
            ],
            content: `import { Router, Request, Response } from 'express';
import { stripeService } from '../services/stripeService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const webhooksRouter = Router();

webhooksRouter.post('/', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret_dev';

  let event;
  try {
    event = stripeService.constructEvent(req.body, signature, webhookSecret);
  } catch (err: any) {
    console.error(\`Webhook signature verification failed: \${err.message}\`);
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id }
  });

  if (existingEvent) {
    return res.status(200).json({ received: true, deduplicated: true });
  }

  await prisma.webhookEvent.create({
    data: {
      stripeEventId: event.id,
      eventType: event.type,
      processedAt: new Date(),
    }
  });

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(\`✅ PaymentIntent \${paymentIntent.id} succeeded!\`);
      await prisma.order.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: 'PAID' }
      });
      break;
    }
    case 'payment_intent.payment_failed': {
      const failedIntent = event.data.object;
      console.warn(\`❌ PaymentIntent \${failedIntent.id} failed!\`);
      await prisma.order.updateMany({
        where: { stripePaymentIntentId: failedIntent.id },
        data: { status: 'CANCELLED' }
      });
      break;
    }
    default:
      console.log(\`Unhandled webhook event type: \${event.type}\`);
  }

  res.status(200).json({ received: true });
});
`
          },
          {
            id: 'server-routes-auth',
            name: 'auth.ts',
            path: 'server/routes/auth.ts',
            type: 'file',
            language: 'typescript',
            size: 2200,
            symbols: [
              { name: 'authRouter', kind: 'variable', line: 8, exported: true },
              { name: 'loginHandler', kind: 'function', line: 12 },
              { name: 'registerHandler', kind: 'function', line: 40 }
            ],
            content: `import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_fallback_secret_key_change_me';

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.encode({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
  }, JWT_SECRET);

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});
`
          },
          {
            id: 'server-routes-products',
            name: 'products.ts',
            path: 'server/routes/products.ts',
            type: 'file',
            language: 'typescript',
            size: 2300,
            symbols: [
              { name: 'productsRouter', kind: 'variable', line: 8, exported: true }
            ],
            content: `import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { redisClient } from '../services/redisCache';

const prisma = new PrismaClient();
export const productsRouter = Router();

productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const cacheKey = \`catalog:p\${page}:l\${limit}\`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const items = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      }
    });

    const total = await prisma.product.count();
    const payload = { items, total, page, totalPages: Math.ceil(total / limit) };

    await redisClient.set(cacheKey, JSON.stringify(payload), 300);
    res.json(payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
`
          }
        ]
      },
      {
        id: 'server-services',
        name: 'services',
        path: 'server/services',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'server-services-stripe',
            name: 'stripeService.ts',
            path: 'server/services/stripeService.ts',
            type: 'file',
            language: 'typescript',
            size: 2600,
            symbols: [
              { name: 'stripeService', kind: 'variable', line: 8, exported: true }
            ],
            content: `import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_51Hz';
const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
});

export const stripeService = {
  async createPaymentIntent({ amount, currency, metadata }: { amount: number; currency: string; metadata?: Record<string, string> }) {
    return stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    }, {
      idempotencyKey: metadata?.userId ? \`pi_user_\${metadata.userId}_\${Date.now()}\` : undefined,
    });
  },

  async retrievePaymentIntent(id: string) {
    return stripe.paymentIntents.retrieve(id);
  },

  constructEvent(rawBody: Buffer | string, signature: string, secret: string) {
    return stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
};
`
          },
          {
            id: 'server-services-inventory',
            name: 'inventoryService.ts',
            path: 'server/services/inventoryService.ts',
            type: 'file',
            language: 'typescript',
            size: 2200,
            symbols: [
              { name: 'inventoryService', kind: 'variable', line: 6, exported: true }
            ],
            content: `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const inventoryService = {
  async reserveStock(items: { id: string; quantity: number }[], userId: string) {
    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product || product.inventoryCount < item.quantity) {
          throw new Error(\`Stock unavailable for item ID \${item.id}\`);
        }

        await tx.product.update({
          where: { id: item.id },
          data: {
            inventoryCount: {
              decrement: item.quantity,
            }
          }
        });
      }
    });
  }
};
`
          },
          {
            id: 'server-services-rediscache',
            name: 'redisCache.ts',
            path: 'server/services/redisCache.ts',
            type: 'file',
            language: 'typescript',
            size: 1300,
            symbols: [
              { name: 'redisClient', kind: 'variable', line: 5, exported: true }
            ],
            content: `class InMemoryRedisMock {
  private store = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<'OK'> {
    this.store.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
    return 'OK';
  }

  async ping(): Promise<boolean> {
    return true;
  }
}

export const redisClient = new InMemoryRedisMock();
`
          }
        ]
      },
      {
        id: 'server-middleware',
        name: 'middleware',
        path: 'server/middleware',
        type: 'directory',
        isOpen: false,
        children: [
          {
            id: 'server-middleware-authguard',
            name: 'authGuard.ts',
            path: 'server/middleware/authGuard.ts',
            type: 'file',
            language: 'typescript',
            size: 1500,
            symbols: [
              { name: 'authGuard', kind: 'function', line: 6, exported: true }
            ],
            content: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_fallback_secret_key_change_me';

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.decode(token, JWT_SECRET);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: 'Token expired' });
    }
    (req as any).user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}
`
          },
          {
            id: 'server-middleware-ratelimiter',
            name: 'rateLimiter.ts',
            path: 'server/middleware/rateLimiter.ts',
            type: 'file',
            language: 'typescript',
            size: 1200,
            symbols: [
              { name: 'rateLimiter', kind: 'function', line: 5, exported: true }
            ],
            content: `import { Request, Response, NextFunction } from 'express';

const ipHits = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || (import.meta.env.VITE_DEFAULT_IP || '127.0.0.1');
  const now = Date.now();
  const windowMs = ${APP_CONFIG.security.rateLimit.windowMs};
  const maxRequests = 120;

  const current = ipHits.get(ip);
  if (!current || now > current.resetTime) {
    ipHits.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (current.count >= maxRequests) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please retry in 60s.' });
  }

  current.count++;
  next();
}
`
          }
        ]
      }
    ]
  },
  {
    id: 'prisma',
    name: 'prisma',
    path: 'prisma',
    type: 'directory',
    isOpen: true,
    children: [
      {
        id: 'prisma-schema',
        name: 'schema.prisma',
        path: 'prisma/schema.prisma',
        type: 'file',
        language: 'prisma',
        size: 2400,
        symbols: [
          { name: 'User', kind: 'schema', line: 12 },
          { name: 'Product', kind: 'schema', line: 26 },
          { name: 'Order', kind: 'schema', line: 38 },
          { name: 'WebhookEvent', kind: 'schema', line: 58 }
        ],
        content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  CANCELLED
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  passwordHash  String
  role          Role      @default(CUSTOMER)
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
}

model Product {
  id             String      @id @default(uuid())
  title          String
  description    String
  price          Float
  inventoryCount Int         @default(0)
  sku            String      @unique
  orderItems     OrderItem[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([sku])
}

model Order {
  id                    String      @id @default(uuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id])
  totalAmount           Float
  status                OrderStatus @default(PENDING)
  stripePaymentIntentId String?     @unique
  items                 OrderItem[]
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([userId])
  @@index([stripePaymentIntentId])
}

model OrderItem {
  id              String   @id @default(uuid())
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id])
  productId       String
  product         Product  @relation(fields: [productId], references: [id])
  quantity        Int      @default(1)
  priceAtPurchase Float
}

model WebhookEvent {
  id            String   @id @default(uuid())
  stripeEventId String   @unique
  eventType     String
  processedAt   DateTime @default(now())

  @@index([stripeEventId])
}
`
      }
    ]
  },
  {
    id: 'tests',
    name: 'tests',
    path: 'tests',
    type: 'directory',
    isOpen: false,
    children: [
      {
        id: 'tests-checkout',
        name: 'checkout.test.ts',
        path: 'tests/checkout.test.ts',
        type: 'file',
        language: 'typescript',
        size: 1900,
        symbols: [
          { name: 'describe Checkout Integration', kind: 'function', line: 6 }
        ],
        content: `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Checkout Integration Suite', () => {
  it('should create payment intent with server-verified total price', async () => {
    const res = await request(app)
      .post('/api/checkout/create-intent')
      .set('Authorization', 'Bearer mock_jwt_token_development_sandbox')
      .send({
        items: [{ id: 'prod_991', quantity: 2 }]
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clientSecret');
    expect(res.body.amount).toBe(37800);
  });

  it('should reject checkout if product stock is insufficient', async () => {
    const res = await request(app)
      .post('/api/checkout/create-intent')
      .set('Authorization', 'Bearer mock_jwt_token_development_sandbox')
      .send({
        items: [{ id: 'prod_991', quantity: 99999 }]
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Insufficient stock');
  });
});
`
      },
      {
        id: 'tests-stripewebhook',
        name: 'stripeWebhook.test.ts',
        path: 'tests/stripeWebhook.test.ts',
        type: 'file',
        language: 'typescript',
        size: 1650,
        symbols: [
          { name: 'describe Stripe Webhooks', kind: 'function', line: 6 }
        ],
        content: `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Stripe Webhooks Ingestion', () => {
  it('should prevent replay attacks by deduplicating processed stripe event IDs', async () => {
    const payload = JSON.stringify({
      id: 'evt_test_dedup_001',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_123', amount: 4900 } }
    });

    const firstRes = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 't=1600000000,v1=valid_mock_sig')
      .send(payload);

    expect(firstRes.status).toBe(200);

    const secondRes = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 't=1600000000,v1=valid_mock_sig')
      .send(payload);

    expect(secondRes.status).toBe(200);
    expect(secondRes.body.deduplicated).toBe(true);
  });
});
`
      }
    ]
  },
  {
    id: 'package-json',
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    language: 'json',
    size: 1100,
    content: `{
  "name": "shopflow-core",
  "version": "2.4.0",
  "private": true,
  "dependencies": {
    "@prisma/client": "^5.14.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "jwt-simple": "^0.5.6",
    "lucide-react": "^0.383.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "stripe": "^15.8.0"
  }
}`
  },
  {
    id: 'docker-compose-yml',
    name: 'docker-compose.yml',
    path: 'docker-compose.yml',
    type: 'file',
    language: 'yaml',
    size: 650,
    content: `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: shopflow_postgres
    environment:
      POSTGRES_USER: shopflow_admin
      POSTGRES_PASSWORD: secret_postgres_password
      POSTGRES_DB: shopflow_production
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: shopflow_redis
    ports:
      - "6379:6379"
`
  },
  {
    id: 'readme-md',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    language: 'markdown',
    size: 1540,
    content: `# ShopFlow — Modern E-Commerce Platform

ShopFlow is an enterprise-ready headless commerce platform built with React, Node.js/Express, PostgreSQL, Prisma, Stripe Elements V3, and Redis.
`
  }
];

export const mockShopFlowRepository: RepositoryData = {
  id: 'repo_shopflow_01',
  name: 'ShopFlow',
  fullName: 'acme-corp/shopflow-core',
  description: 'Enterprise React & Node.js headless e-commerce repository with PostgreSQL, Stripe Elements, and Redis cache.',
  defaultBranch: 'main',
  currentBranch: 'main',
  branches: [
    'main', 
    'feature/stripe-elements-v3-upgrade', 
    'bugfix/checkout-idempotency', 
    'feature/prisma-inventory-reservation'
  ],
  isDemo: true,
  stats: {
    filesCount: 26,
    linesOfCode: 4820,
    stars: 1420,
    forks: 312,
    lastCommit: '14m ago',
    author: 'alex-dev (Platform Staff)',
    healthScore: 92,
    securityScore: 88,
    testCoverage: 84.5,
    complexityScore: 18,
  },
  metrics: mockShopFlowMetrics,
  hotspots: mockShopFlowHotspots,
  deadCodeItems: mockShopFlowDeadCode,
  duplicateCodeItems: mockShopFlowDuplicateCode,
  languages: [
    { name: 'TypeScript', percentage: 76.4, color: '#3178c6', files: 18 },
    { name: 'Prisma / SQL', percentage: 14.2, color: '#0c344b', files: 3 },
    { name: 'JSON / YAML', percentage: 6.8, color: '#cb171e', files: 4 },
    { name: 'Markdown', percentage: 2.6, color: '#083fa1', files: 1 },
  ],
  frameworks: [
    { name: 'React 18', category: 'frontend', version: '18.3.1', icon: 'Atom' },
    { name: 'Express.js', category: 'backend', version: '4.19.2', icon: 'Server' },
    { name: 'PostgreSQL', category: 'database', version: '16.2', icon: 'Database' },
    { name: 'Prisma ORM', category: 'database', version: '5.14.0', icon: 'Layers' },
    { name: 'Stripe API', category: 'payments', version: '15.8.0', icon: 'CreditCard' },
    { name: 'Redis Cache', category: 'caching', version: '7.2.4', icon: 'Zap' },
    { name: 'Vitest', category: 'testing', version: '1.6.0', icon: 'CheckCircle' },
  ],
  architecture: {
    pattern: 'Layered Modular Monolith (Client-Server Split)',
    description: 'Separation of concerns between React SPA client layer and stateless Express API services, orchestrated with Prisma ORM and external Stripe payment gateway.',
    components: [
      {
        name: 'Client Storefront',
        role: 'Interactive UI, Cart calculations, Stripe Elements mounting',
        path: 'src/',
        technologies: ['React', 'Tailwind CSS', 'Vite', 'Lucide']
      },
      {
        name: 'Checkout & Payment Engine',
        role: 'Payment intent issuance, stock reservation, webhook validation',
        path: 'server/routes/checkout.ts',
        technologies: ['Node.js', 'Express', 'Stripe SDK']
      },
      {
        name: 'Database & Data Access Layer',
        role: 'Schema migrations, relation queries, transactional integrity',
        path: 'prisma/',
        technologies: ['Prisma ORM', 'PostgreSQL 16']
      },
      {
        name: 'Cache & Rate Limiting',
        role: 'Route throttling, session storage, catalog memoization',
        path: 'server/services/redisCache.ts',
        technologies: ['Redis']
      }
    ],
    dataFlowSummary: 'User clicks Pay -> Frontend invokes POST /api/checkout/create-intent -> Server verifies catalog prices -> Locks stock with PostgreSQL transaction -> Creates Stripe PaymentIntent -> Returns clientSecret -> Frontend confirms with Stripe SDK -> Stripe triggers webhook -> Server updates Order to PAID and persists audit log.'
  },
  dependencies: [
    { name: 'stripe', version: '^15.8.0', type: 'production', description: 'Stripe official SDK for Node.js' },
    { name: '@prisma/client', version: '^5.14.0', type: 'production', description: 'Prisma auto-generated query client' },
    { name: 'express', version: '^4.19.2', type: 'production', description: 'Fast, unopinionated web framework' },
    { name: 'jwt-simple', version: '^0.5.6', type: 'production', description: 'JWT authentication encoder/decoder' },
    { name: 'bcrypt', version: '^5.1.1', type: 'production', description: 'Password hashing library' },
    { name: 'vitest', version: '^1.6.0', type: 'development', description: 'Blazing fast unit test framework' },
  ],
  apiRoutes: [
    { method: 'POST', path: '/api/checkout/create-intent', handlerFile: 'server/routes/checkout.ts', handlerSymbol: 'createPaymentIntentHandler', authRequired: true, description: 'Calculates price on server and reserves stock' },
    { method: 'POST', path: '/api/checkout/confirm', handlerFile: 'server/routes/checkout.ts', handlerSymbol: 'confirmOrderHandler', authRequired: true, description: 'Verifies successful payment intent and creates order' },
    { method: 'POST', path: '/api/webhooks/stripe', handlerFile: 'server/routes/webhooks.ts', handlerSymbol: 'handleStripeWebhook', authRequired: false, description: 'Ingests Stripe asynchronous events with HMAC verification' },
    { method: 'POST', path: '/api/auth/login', handlerFile: 'server/routes/auth.ts', handlerSymbol: 'loginHandler', authRequired: false, description: 'Authenticates user and returns 7-day JWT token' },
    { method: 'GET', path: '/api/products', handlerFile: 'server/routes/products.ts', handlerSymbol: 'productsRouter', authRequired: false, description: 'Returns paginated catalog with Redis cache' },
    { method: 'GET', path: '/health', handlerFile: 'server/index.ts', handlerSymbol: 'app', authRequired: false, description: 'Diagnostic uptime and database connectivity probe' },
  ],
  databaseModels: [
    { name: 'User', tableName: 'users', file: 'prisma/schema.prisma', fieldsCount: 7, relations: ['orders'] },
    { name: 'Product', tableName: 'products', file: 'prisma/schema.prisma', fieldsCount: 8, relations: ['orderItems'] },
    { name: 'Order', tableName: 'orders', file: 'prisma/schema.prisma', fieldsCount: 8, relations: ['user', 'items'] },
    { name: 'OrderItem', tableName: 'order_items', file: 'prisma/schema.prisma', fieldsCount: 6, relations: ['order', 'product'] },
    { name: 'WebhookEvent', tableName: 'webhook_events', file: 'prisma/schema.prisma', fieldsCount: 4, relations: [] },
  ],
  rootFiles: mockShopFlowFiles,
};
