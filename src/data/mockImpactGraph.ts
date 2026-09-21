import { Node, Edge } from '@xyflow/react';
import { GraphNodeData, BlastRadiusResult, FeatureChangePlan } from '../types/impact';

export const initialImpactNodes: Node<GraphNodeData>[] = [
  // Database Layer
  {
    id: 'db_orders',
    type: 'dbNode',
    position: { x: 50, y: 350 },
    data: {
      label: 'orders (PostgreSQL)',
      sublabel: 'Prisma Model',
      type: 'database',
      path: 'prisma/schema.prisma',
      symbol: 'Order',
      riskScore: 88,
      details: {
        description: 'Core financial transactions table with indexes on userId and stripePaymentIntentId.',
        callCount: 12,
        testCoverage: 92,
        dependentsCount: 5,
        dependenciesCount: 1,
      }
    }
  },
  {
    id: 'db_products',
    type: 'dbNode',
    position: { x: 50, y: 150 },
    data: {
      label: 'products (PostgreSQL)',
      sublabel: 'Prisma Model',
      type: 'database',
      path: 'prisma/schema.prisma',
      symbol: 'Product',
      riskScore: 65,
      details: {
        description: 'Catalog stock and price tracking with pessimistic row locking.',
        callCount: 24,
        testCoverage: 80,
        dependentsCount: 4,
        dependenciesCount: 0,
      }
    }
  },
  {
    id: 'db_webhook_events',
    type: 'dbNode',
    position: { x: 50, y: 520 },
    data: {
      label: 'webhook_events',
      sublabel: 'Prisma Model',
      type: 'database',
      path: 'prisma/schema.prisma',
      symbol: 'WebhookEvent',
      riskScore: 40,
      details: {
        description: 'Deduplication ledger for Stripe webhook events preventing double execution.',
        callCount: 4,
        testCoverage: 100,
        dependentsCount: 2,
        dependenciesCount: 0,
      }
    }
  },

  // Service / Backend Engine Layer
  {
    id: 'srv_inventory',
    type: 'serviceNode',
    position: { x: 380, y: 150 },
    data: {
      label: 'inventoryService.reserveStock()',
      sublabel: 'Pessimistic Tx Locking',
      type: 'service',
      path: 'server/services/inventoryService.ts',
      symbol: 'reserveStock',
      riskScore: 78,
      details: {
        description: 'Executes atomic stock reservation in PostgreSQL transaction block.',
        callCount: 8,
        testCoverage: 85,
        dependentsCount: 2,
        dependenciesCount: 1,
      }
    }
  },
  {
    id: 'srv_stripe',
    type: 'serviceNode',
    position: { x: 380, y: 350 },
    data: {
      label: 'stripeService.createPaymentIntent()',
      sublabel: 'Stripe SDK Wrapper',
      type: 'service',
      path: 'server/services/stripeService.ts',
      symbol: 'createPaymentIntent',
      riskScore: 92,
      details: {
        description: 'Stripe API client with auto-idempotency hashing and telemetry.',
        callCount: 16,
        testCoverage: 88,
        dependentsCount: 3,
        dependenciesCount: 0,
      }
    }
  },
  {
    id: 'srv_redis',
    type: 'serviceNode',
    position: { x: 380, y: 20 },
    data: {
      label: 'redisClient (Cache/RateLimit)',
      sublabel: 'In-Memory Store',
      type: 'service',
      path: 'server/services/redisCache.ts',
      symbol: 'redisClient',
      riskScore: 30,
      details: {
        description: 'Distributed catalog caching and IP sliding-window rate limiting.',
        callCount: 30,
        testCoverage: 75,
        dependentsCount: 3,
        dependenciesCount: 0,
      }
    }
  },

  // API Route Handlers
  {
    id: 'api_create_intent',
    type: 'apiNode',
    position: { x: 740, y: 220 },
    data: {
      label: 'POST /api/checkout/create-intent',
      sublabel: 'Authenticated Checkout Route',
      type: 'api',
      path: 'server/routes/checkout.ts',
      symbol: 'createPaymentIntentHandler',
      riskScore: 95,
      details: {
        description: 'Calculates prices on server, locks inventory, and issues client secret.',
        callCount: 45,
        testCoverage: 90,
        dependentsCount: 3,
        dependenciesCount: 3,
      }
    }
  },
  {
    id: 'api_confirm',
    type: 'apiNode',
    position: { x: 740, y: 380 },
    data: {
      label: 'POST /api/checkout/confirm',
      sublabel: 'Order Finalization Route',
      type: 'api',
      path: 'server/routes/checkout.ts',
      symbol: 'confirmOrderHandler',
      riskScore: 85,
      details: {
        description: 'Verifies Stripe intent status and creates persistent Order record.',
        callCount: 20,
        testCoverage: 84,
        dependentsCount: 2,
        dependenciesCount: 2,
      }
    }
  },
  {
    id: 'api_webhook',
    type: 'apiNode',
    position: { x: 740, y: 520 },
    data: {
      label: 'POST /api/webhooks/stripe',
      sublabel: 'HMAC Webhook Ingestion',
      type: 'api',
      path: 'server/routes/webhooks.ts',
      symbol: 'handleStripeWebhook',
      riskScore: 80,
      details: {
        description: 'Asynchronous event handler for payment success, refund, and chargeback events.',
        callCount: 15,
        testCoverage: 95,
        dependentsCount: 2,
        dependenciesCount: 2,
      }
    }
  },

  // Frontend Client Layer
  {
    id: 'fe_hook_usepayment',
    type: 'functionNode',
    position: { x: 1080, y: 220 },
    data: {
      label: 'usePayment() Hook',
      sublabel: 'React State Machine',
      type: 'function',
      path: 'src/hooks/usePayment.ts',
      symbol: 'usePayment',
      riskScore: 70,
      details: {
        description: 'Manages payment intent creation, confirmation state, and error handling.',
        callCount: 10,
        testCoverage: 80,
        dependentsCount: 2,
        dependenciesCount: 2,
      }
    }
  },
  {
    id: 'fe_page_checkout',
    type: 'fileNode',
    position: { x: 1400, y: 220 },
    data: {
      label: 'CheckoutPage.tsx',
      sublabel: 'Storefront UI',
      type: 'file',
      path: 'src/pages/Checkout.tsx',
      symbol: 'CheckoutPage',
      riskScore: 60,
      details: {
        description: 'Main checkout view with address inputs, card elements, and order summary.',
        callCount: 5,
        testCoverage: 70,
        dependentsCount: 1,
        dependenciesCount: 3,
      }
    }
  },

  // Test Suites Layer
  {
    id: 'test_checkout_suite',
    type: 'testNode',
    position: { x: 1080, y: 460 },
    data: {
      label: 'checkout.test.ts',
      sublabel: 'Vitest Integration Suite',
      type: 'test',
      path: 'tests/checkout.test.ts',
      symbol: 'Checkout Integration',
      riskScore: 15,
      details: {
        description: 'Automated integration tests validating pricing integrity and stock boundaries.',
        callCount: 6,
        testCoverage: 100,
        dependentsCount: 0,
        dependenciesCount: 2,
      }
    }
  },
  {
    id: 'test_webhook_suite',
    type: 'testNode',
    position: { x: 1080, y: 580 },
    data: {
      label: 'stripeWebhook.test.ts',
      sublabel: 'Replay Protection Test',
      type: 'test',
      path: 'tests/stripeWebhook.test.ts',
      symbol: 'Stripe Webhooks',
      riskScore: 10,
      details: {
        description: 'Validates signature verification and event deduplication.',
        callCount: 4,
        testCoverage: 100,
        dependentsCount: 0,
        dependenciesCount: 1,
      }
    }
  }
];

export const initialImpactEdges: Edge[] = [
  // Database to Services
  { id: 'e-db_products-srv_inventory', source: 'db_products', target: 'srv_inventory', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-db_orders-srv_stripe', source: 'db_orders', target: 'srv_stripe', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-db_orders-api_confirm', source: 'db_orders', target: 'api_confirm', style: { stroke: '#64748b' } },
  { id: 'e-db_webhook_events-api_webhook', source: 'db_webhook_events', target: 'api_webhook', style: { stroke: '#64748b' } },

  // Services to API Routes
  { id: 'e-srv_inventory-api_create_intent', source: 'srv_inventory', target: 'api_create_intent', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e-srv_stripe-api_create_intent', source: 'srv_stripe', target: 'api_create_intent', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e-srv_stripe-api_confirm', source: 'srv_stripe', target: 'api_confirm', style: { stroke: '#06b6d4' } },
  { id: 'e-srv_stripe-api_webhook', source: 'srv_stripe', target: 'api_webhook', style: { stroke: '#06b6d4' } },

  // API Routes to Frontend
  { id: 'e-api_create_intent-fe_hook_usepayment', source: 'api_create_intent', target: 'fe_hook_usepayment', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e-api_confirm-fe_hook_usepayment', source: 'api_confirm', target: 'fe_hook_usepayment', style: { stroke: '#10b981' } },
  { id: 'e-fe_hook_usepayment-fe_page_checkout', source: 'fe_hook_usepayment', target: 'fe_page_checkout', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },

  // API Routes to Tests
  { id: 'e-api_create_intent-test_checkout_suite', source: 'api_create_intent', target: 'test_checkout_suite', style: { stroke: '#f59e0b', strokeDasharray: '4 4' } },
  { id: 'e-api_webhook-test_webhook_suite', source: 'api_webhook', target: 'test_webhook_suite', style: { stroke: '#f59e0b', strokeDasharray: '4 4' } },
];

export const mockBlastRadii: Record<string, BlastRadiusResult> = {
  api_create_intent: {
    targetNodeId: 'api_create_intent',
    targetLabel: 'POST /api/checkout/create-intent',
    riskScore: 92,
    overallRiskCategory: 'CRITICAL',
    impactSummary: 'Modifying the create-intent endpoint impacts the entire checkout funnel, affecting payment tokenization, server inventory reservation locks, and frontend customer conversion.',
    affectedFiles: [
      'server/routes/checkout.ts',
      'src/hooks/usePayment.ts',
      'src/pages/Checkout.tsx',
      'tests/checkout.test.ts'
    ],
    affectedRoutes: ['POST /api/checkout/create-intent', 'POST /api/checkout/confirm'],
    affectedComponents: ['CheckoutPage', 'CartSummary', 'usePayment hook', 'inventoryService'],
    affectedDbTables: ['products (stock decrements)', 'orders', 'webhook_events'],
    affectedTests: ['tests/checkout.test.ts (Pricing Integrity & Stock Verification)'],
    suggestedValidationSteps: [
      'Run `npm run test` to verify Vitest integration tests pass',
      'Execute manual test with out-of-stock item in cart',
      'Verify Stripe PaymentIntent client secret is returned to frontend securely',
      'Check Redis rate limiter response on concurrent bursts (>120 req/min)'
    ]
  },
  db_orders: {
    targetNodeId: 'db_orders',
    targetLabel: 'orders (PostgreSQL Table & Prisma Model)',
    riskScore: 88,
    overallRiskCategory: 'HIGH',
    impactSummary: 'Schema modifications to the Order model require database migration synchronization, indexing adjustments, and API payload updates in checkout confirmation and webhook ingestion.',
    affectedFiles: [
      'prisma/schema.prisma',
      'server/routes/checkout.ts',
      'server/routes/webhooks.ts',
      'src/types/index.ts'
    ],
    affectedRoutes: ['POST /api/checkout/confirm', 'POST /api/webhooks/stripe'],
    affectedComponents: ['Order model', 'OrderItem relations', 'Webhook handler'],
    affectedDbTables: ['orders', 'order_items', 'users'],
    affectedTests: ['tests/checkout.test.ts', 'tests/stripeWebhook.test.ts'],
    suggestedValidationSteps: [
      'Generate migration via `npx prisma migrate dev --name <migration_name>`',
      'Ensure foreign keys and indexes on `stripePaymentIntentId` and `userId` are maintained',
      'Validate existing historical orders query compatibility'
    ]
  }
};

export const sampleChangePlans: FeatureChangePlan[] = [
  {
    id: 'plan_apple_pay',
    userPrompt: 'What do I need to change to add Apple Pay and Google Pay via Stripe Payment Request Button?',
    featureTitle: 'Add Apple Pay & Google Pay Express Checkout',
    estimatedEffort: '3 - 4 Engineering Hours',
    riskLevel: 'MEDIUM',
    architecturalOverview: 'To enable express digital wallets, we need to add the Stripe Payment Request Button element on the frontend, register the Apple Pay domain association file, update intent initialization to specify express payment methods, and handle wallet-specific billing address callbacks.',
    impactedLayers: ['Frontend UI', 'Stripe SDK Config', 'API Route Handlers', 'Test Suites'],
    steps: [
      {
        stepNumber: 1,
        title: 'Add Payment Request Element to Frontend Checkout',
        category: 'frontend_ui',
        targetFile: 'src/pages/Checkout.tsx',
        action: 'modify',
        summary: 'Mount the PaymentRequestButtonElement above the traditional credit card form to enable 1-click biometric checkout on supported iOS/macOS and Android devices.',
        codeSnippet: `// Inside CheckoutPage.tsx
const paymentRequest = stripe.paymentRequest({
  country: 'US',
  currency: 'usd',
  total: { label: 'ShopFlow Cart Total', amount: 24850 },
  requestPayerName: true,
  requestPayerEmail: true,
});`
      },
      {
        stepNumber: 2,
        title: 'Update Stripe Intent Creation with Wallet Capabilities',
        category: 'backend_service',
        targetFile: 'server/services/stripeService.ts',
        action: 'modify',
        summary: 'Ensure automatic_payment_methods is enabled with allowed payment method types including card and apple_pay.',
        codeSnippet: `// server/services/stripeService.ts
return stripe.paymentIntents.create({
  amount,
  currency,
  payment_method_types: ['card', 'link'],
  metadata: { ...metadata, walletSupported: 'true' },
});`
      },
      {
        stepNumber: 3,
        title: 'Add Wallet Checkout Integration Test Case',
        category: 'testing',
        targetFile: 'tests/checkout.test.ts',
        action: 'add_test',
        summary: 'Simulate successful tokenized wallet authorization and verify order fulfillment.',
        codeSnippet: `it('should process express wallet token authorization smoothly', async () => {
  const res = await request(app).post('/api/checkout/confirm').send({
    paymentIntentId: 'pi_mock_apple_pay_998',
    walletSource: 'apple_pay',
  });
  expect(res.status).toBe(200);
});`
      }
    ],
    requiredTests: [
      'Validate domain association file at `/.well-known/apple-developer-merchantid-domain-association`',
      'Verify fallback to standard Card Elements on unsupported browsers',
      'Verify total calculation matches cart item sum plus dynamic shipping tax'
    ],
    securityConsiderations: [
      'Never accept client-supplied amounts directly in the wallet callback; always reconcile with backend cart snapshot',
      'Ensure CSRF and JWT auth tokens accompany express wallet requests'
    ]
  },
  {
    id: 'plan_rbac_admin',
    userPrompt: 'What do I need to change to implement Role-Based Access Control (RBAC) with Admin Dashboard for product management?',
    featureTitle: 'Implement Role-Based Access Control (RBAC) & Admin Catalog API',
    estimatedEffort: '5 - 6 Engineering Hours',
    riskLevel: 'HIGH',
    architecturalOverview: 'Introduce an `adminGuard` middleware verifying `req.user.role === "ADMIN"`, create CRUD product management endpoints (`POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`), and add an Admin catalog management panel.',
    impactedLayers: ['Authentication Middleware', 'Backend Product Routes', 'Prisma Schema & Migrations', 'Frontend Admin Views', 'Unit Tests'],
    steps: [
      {
        stepNumber: 1,
        title: 'Create adminGuard Middleware',
        category: 'backend_service',
        targetFile: 'server/middleware/adminGuard.ts',
        action: 'create',
        summary: 'Intercept requests and assert decoded JWT contains `role === "ADMIN"`. Return 403 Forbidden on violation.',
        codeSnippet: `export function adminGuard(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user || (req as any).user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Requires Administrator Privileges' });
  }
  next();
}`
      },
      {
        stepNumber: 2,
        title: 'Add Protected Admin Product Management Routes',
        category: 'api_route',
        targetFile: 'server/routes/products.ts',
        action: 'modify',
        summary: 'Mount POST, PUT, and DELETE endpoints wrapped in `[authGuard, adminGuard]` to manage store inventory.',
        codeSnippet: `productsRouter.post('/', authGuard, adminGuard, async (req, res) => {
  const { title, description, price, inventoryCount, sku } = req.body;
  const newProduct = await prisma.product.create({ data: { title, description, price, inventoryCount, sku } });
  await redisClient.del('catalog:*'); // Invalidate catalog cache
  res.status(201).json(newProduct);
});`
      },
      {
        stepNumber: 3,
        title: 'Add Security Guard RBAC Tests',
        category: 'testing',
        targetFile: 'tests/auth.test.ts',
        action: 'add_test',
        summary: 'Test that standard CUSTOMER JWT tokens receive 403 Forbidden when attempting to modify catalog.',
        codeSnippet: `it('should reject non-admin users attempting to create products with 403', async () => {
  const customerToken = generateTestToken({ role: 'CUSTOMER' });
  const res = await request(app).post('/api/products').set('Authorization', \`Bearer \${customerToken}\`).send({ title: 'Hacked Item' });
  expect(res.status).toBe(403);
});`
      }
    ],
    requiredTests: [
      'Test 401 Unauthorized for unauthenticated requests',
      'Test 403 Forbidden for authenticated CUSTOMER requests',
      'Test 201 Created and cache invalidation for ADMIN requests'
    ],
    securityConsiderations: [
      'Ensure role cannot be altered via user profile update endpoints',
      'Refresh user JWT token or enforce database-backed session validation for critical admin actions'
    ]
  }
];
