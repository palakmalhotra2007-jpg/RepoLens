import { MergeConflictBlock, SemanticConflictAlert, BranchComparison } from '../types/merge';

export const mockMergeConflicts: MergeConflictBlock[] = [
  {
    id: 'conflict_checkout_01',
    file: 'server/routes/checkout.ts',
    lineStart: 38,
    lineEnd: 54,
    conflictType: 'textual',
    title: 'Stripe Intent Creation & Idempotency Key Parameter Divergence',
    reason: 'Both branches modified how the payment intent is initialized in Stripe, but with conflicting telemetry metadata and idempotency key formulations.',
    whatConflicted: 'Method signature and payload object in `stripeService.createPaymentIntent()` call within `server/routes/checkout.ts:38-54`.',
    whyItConflicted: 'Branch `feat/stripe-elements-v3` added Elements v3 UI telemetry and cart count metadata, while `fix/checkout-idempotency` added strict idempotency key headers to prevent duplicate transactions on network retries.',
    whatEachBranchChanged: {
      base: 'Invoked stripe.paymentIntents.create with only total amount and currency.',
      ours: 'Delegated to stripeService.createPaymentIntent with metadata: { userId, itemCount, checkoutVersion: "v3_elements" }.',
      theirs: 'Delegated to stripeService.createPaymentIntent with metadata: { userId } and idempotencyKey: req.headers["idempotency-key"].'
    },
    whyItHappened: {
      baseContext: 'Base branch previously created payment intent with only amount and currency.',
      oursIntent: 'Branch `feat/stripe-elements-v3` added automatic_payment_methods and cart item count metadata for the new checkout UI.',
      theirsIntent: 'Branch `fix/checkout-idempotency` added strict idempotencyKey header hashing to prevent double-charging users during retries.',
    },
    baseCode: `    // Base implementation (v2.3)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency,
    });`,
    oursCode: `    // Ours: feat/stripe-elements-v3
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalCents,
      currency,
      metadata: {
        userId,
        itemCount: items.length.toString(),
        checkoutVersion: 'v3_elements',
      },
    });`,
    theirsCode: `    // Theirs: main / fix/checkout-idempotency
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalCents,
      currency,
      metadata: { userId },
      idempotencyKey: req.headers['idempotency-key'] || \`order_\${userId}_\${Date.now()}\`,
    });`,
    aiSuggestedCode: `    // ✨ AI Smart Merge: Preserves v3 Elements metadata while enforcing idempotency protection
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalCents,
      currency,
      metadata: {
        userId,
        itemCount: items.length.toString(),
        checkoutVersion: 'v3_elements',
      },
      idempotencyKey: (req.headers['idempotency-key'] as string) || \`order_\${userId}_\${Date.now()}\`,
    });`,
    resolutionStatus: 'unresolved',
    affectedComponents: [
      'server/routes/checkout.ts',
      'server/services/stripeService.ts',
      'src/pages/Checkout.tsx',
      'tests/checkout.test.ts'
    ],
    semanticRiskSeverity: 'high',
    semanticImpact: 'If resolved incorrectly without idempotency key support, retried network requests will trigger duplicate payment intents in Stripe dashboard. If resolved without metadata, Stripe Webhook fulfillment will fail to associate cart items.',
    resolutionSuggestion: 'Synthesize both changes by retaining the rich metadata object from `feat/stripe-elements-v3` while incorporating the `idempotencyKey` fallback parameter from `main`.'
  },
  {
    id: 'conflict_schema_02',
    file: 'prisma/schema.prisma',
    lineStart: 44,
    lineEnd: 56,
    conflictType: 'schema_drift',
    title: 'Order Status Enum & Column Indexing Collision',
    reason: 'Ours added `stripePaymentIntentId` unique index, while Theirs added `refundReason` optional field and `REFUNDED` status enum.',
    whatConflicted: 'Order model definition and OrderStatus enum entries in `prisma/schema.prisma`.',
    whyItConflicted: 'Concurrent branches modified the database schema independently: `feat/stripe-elements-v3` added payment intent indexing and shipping statuses, while `main` added dispute and refund support.',
    whatEachBranchChanged: {
      base: 'OrderStatus enum: PENDING, PAID, CANCELLED. Order model with basic fields.',
      ours: 'Added PROCESSING, SHIPPED to OrderStatus enum and unique index `@unique stripePaymentIntentId` to Order.',
      theirs: 'Added REFUNDED, DISPUTED to OrderStatus enum and optional column `refundReason String?` to Order.'
    },
    whyItHappened: {
      baseContext: 'Base model had status enum: PENDING, PAID, CANCELLED.',
      oursIntent: 'Added unique index on stripePaymentIntentId for fast webhook lookups.',
      theirsIntent: 'Added REFUNDED and DISPUTED to enum along with refund metadata field.',
    },
    baseCode: `enum OrderStatus {
  PENDING
  PAID
  CANCELLED
}

model Order {
  id          String      @id @default(uuid())
  userId      String
  status      OrderStatus @default(PENDING)
}`,
    oursCode: `enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  CANCELLED
}

model Order {
  id                    String      @id @default(uuid())
  userId                String
  status                OrderStatus @default(PENDING)
  stripePaymentIntentId String?     @unique
}`,
    theirsCode: `enum OrderStatus {
  PENDING
  PAID
  CANCELLED
  REFUNDED
  DISPUTED
}

model Order {
  id            String      @id @default(uuid())
  userId        String
  status        OrderStatus @default(PENDING)
  refundReason  String?
}`,
    aiSuggestedCode: `enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  CANCELLED
  REFUNDED
  DISPUTED
}

model Order {
  id                    String      @id @default(uuid())
  userId                String
  status                OrderStatus @default(PENDING)
  stripePaymentIntentId String?     @unique
  refundReason          String?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
}`,
    resolutionStatus: 'unresolved',
    affectedComponents: [
      'prisma/schema.prisma',
      'server/routes/checkout.ts',
      'server/routes/webhooks.ts',
      'src/types/index.ts'
    ],
    semanticRiskSeverity: 'critical',
    semanticImpact: 'A textual collision in schema.prisma causes Prisma migration engine failure during CI/CD deploy. Dropping either branch enum values causes runtime database deserialization crashes on existing orders.',
    resolutionSuggestion: 'Merge both enum definitions into a unified superset (`PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `CANCELLED`, `REFUNDED`, `DISPUTED`) and keep both `stripePaymentIntentId` and `refundReason` columns on Order.'
  }
];

export const mockSemanticAlerts: SemanticConflictAlert[] = [
  {
    id: 'sem_alert_01',
    title: 'Silent API Contract Break: Token Payload Field Renaming',
    category: 'api_signature',
    severity: 'critical',
    fileA: 'server/routes/auth.ts',
    fileB: 'src/context/AuthContext.tsx',
    description: 'Git merged both files with 0 textual conflicts because changes happened in separate directories. However, auth.ts renamed the response key from `token` to `accessToken`, breaking frontend AuthContext.tsx at runtime.',
    gitMergeStatus: 'git_clean_merge_with_hidden_runtime_break',
    rootCause: 'Branch B refactored backend JWT format to OAuth2 standards, while Branch A created the new Checkout authentication context expecting legacy response shape.',
    runtimeBreakRisk: 'Users will be logged out or unable to checkout because `localStorage.getItem("shopflow_jwt_token")` receives undefined.',
    recommendedResolution: 'Update AuthContext.tsx to accept `accessToken || token` or revert backend response key to include backwards-compatible alias.',
    diffA: `// server/routes/auth.ts: Line 32
- res.json({ token, user: ... });
+ res.json({ accessToken: token, user: ... });`,
    diffB: `// src/context/AuthContext.tsx: Line 25
const login = (newToken: string, newUser: User) => {
  setToken(newToken); // Expects 'token' from response.data.token
};`
  },
  {
    id: 'sem_alert_02',
    title: 'Database Schema Drift: Pending Migration Sequence Divergence',
    category: 'database_migration',
    severity: 'high',
    fileA: 'prisma/migrations/20240901_add_stripe_intent.sql',
    fileB: 'prisma/migrations/20240902_add_order_refunds.sql',
    description: 'Two separate migrations with overlapping timestamp prefixes modify the same PostgreSQL orders table. When deployed in CI/CD, Prisma migration engine will halt with checksum mismatch.',
    gitMergeStatus: 'structural_mismatch',
    rootCause: 'Concurrent branches generated Prisma migrations independently without rebasing against latest main.',
    runtimeBreakRisk: 'Automated CI/CD pipeline failure and database migration lock during release rollout.',
    recommendedResolution: 'Run `npx prisma migrate dev --create-only` to consolidate into a single unified migration step.',
    diffA: `ALTER TABLE "orders" ADD COLUMN "stripePaymentIntentId" TEXT;`,
    diffB: `ALTER TABLE "orders" ADD COLUMN "refundReason" TEXT;`
  }
];

export const mockConflictBranchComparison: BranchComparison = {
  comparisonState: 'conflicts_found',
  baseBranch: 'main',
  currentBranch: 'feat/stripe-elements-v3',
  targetBranch: 'main',
  aheadCount: 4,
  behindCount: 2,
  conflictingFilesCount: 2,
  semanticConflictsCount: 2,
  addedFiles: [
    'src/components/checkout/StripeElementsWrapper.tsx',
    'src/services/stripeTelemetry.ts',
    'tests/stripeElements.test.tsx'
  ],
  deletedFiles: [
    'src/legacy/LegacyCardForm.tsx'
  ],
  modifiedFiles: [
    'server/routes/checkout.ts',
    'prisma/schema.prisma',
    'server/services/stripeService.ts',
    'src/pages/Checkout.tsx'
  ],
  renamedFiles: [
    'server/services/stripe.ts ➔ server/services/stripeService.ts'
  ],
  changedFunctions: [
    {
      name: 'createPaymentIntentHandler',
      file: 'server/routes/checkout.ts',
      impact: 'Changed signature to accept idempotency key and cart item count metadata'
    },
    {
      name: 'confirmOrderHandler',
      file: 'server/routes/checkout.ts',
      impact: 'Added atomic transaction wrapping with inventory stock reservation'
    },
    {
      name: 'createPaymentIntent',
      file: 'server/services/stripeService.ts',
      impact: 'Updated Stripe SDK parameters for automatic payment method enablement'
    }
  ],
  changedApis: [
    {
      route: 'POST /api/checkout/create-intent',
      method: 'POST',
      impact: 'Request body expanded to include checkoutVersion and items telemetry'
    },
    {
      route: 'POST /api/checkout/confirm',
      method: 'POST',
      impact: 'Requires client-provided idempotencyKey header'
    }
  ],
  changedDatabaseStructures: [
    {
      table: 'Order',
      change: 'Added unique index on stripePaymentIntentId and optional refundReason column'
    },
    {
      table: 'OrderStatus (enum)',
      change: 'Expanded enum values with PROCESSING, SHIPPED, REFUNDED, DISPUTED'
    }
  ],
  changedDependencies: [
    {
      name: '@stripe/stripe-js',
      oldVersion: '2.1.0',
      newVersion: '3.0.7'
    },
    {
      name: '@stripe/react-stripe-js',
      oldVersion: '2.1.0',
      newVersion: '2.6.0'
    }
  ],
  conflicts: mockMergeConflicts,
  semanticAlerts: mockSemanticAlerts,
};

export const mockCleanBranchComparison: BranchComparison = {
  comparisonState: 'no_conflicts',
  baseBranch: 'main',
  currentBranch: 'refactor/redis-caching',
  targetBranch: 'main',
  aheadCount: 2,
  behindCount: 0,
  conflictingFilesCount: 0,
  semanticConflictsCount: 0,
  addedFiles: [
    'server/services/redisCache.ts',
    'tests/redisCache.test.ts'
  ],
  deletedFiles: [],
  modifiedFiles: [
    'server/routes/products.ts',
    'server/index.ts'
  ],
  renamedFiles: [],
  changedFunctions: [
    {
      name: 'getCachedProducts',
      file: 'server/services/redisCache.ts',
      impact: 'Added TTL-cached query helper with auto-fallback to PostgreSQL'
    }
  ],
  changedApis: [
    {
      route: 'GET /api/products',
      method: 'GET',
      impact: 'Serves from Redis cache with Cache-Control headers'
    }
  ],
  changedDatabaseStructures: [],
  changedDependencies: [
    {
      name: 'ioredis',
      oldVersion: '5.3.0',
      newVersion: '5.3.2'
    }
  ],
  conflicts: [],
  semanticAlerts: [],
};

export const mockEmptyBranchComparison: BranchComparison = {
  comparisonState: 'no_comparison',
  baseBranch: 'main',
  currentBranch: 'main',
  targetBranch: 'main',
  aheadCount: 0,
  behindCount: 0,
  conflictingFilesCount: 0,
  semanticConflictsCount: 0,
  addedFiles: [],
  deletedFiles: [],
  modifiedFiles: [],
  renamedFiles: [],
  changedFunctions: [],
  changedApis: [],
  changedDatabaseStructures: [],
  changedDependencies: [],
  conflicts: [],
  semanticAlerts: [],
};

// Default export
export const mockBranchComparison: BranchComparison = mockEmptyBranchComparison;
