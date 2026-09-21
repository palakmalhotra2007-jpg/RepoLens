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
    affectedComponents: ['server/routes/checkout.ts', 'server/services/stripeService.ts', 'src/pages/Checkout.tsx'],
    semanticRiskSeverity: 'high',
  },
  {
    id: 'conflict_schema_02',
    file: 'prisma/schema.prisma',
    lineStart: 44,
    lineEnd: 56,
    conflictType: 'schema_drift',
    title: 'Order Status Enum & Column Indexing Collision',
    reason: 'Ours added `stripePaymentIntentId` unique index, while Theirs added `refundReason` optional field and `REFUNDED` status enum.',
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
    affectedComponents: ['prisma/schema.prisma', 'server/routes/checkout.ts', 'server/routes/webhooks.ts'],
    semanticRiskSeverity: 'critical',
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

export const mockBranchComparison: BranchComparison = {
  baseBranch: 'main',
  currentBranch: 'feat/stripe-elements-v3',
  targetBranch: 'main',
  aheadCount: 4,
  behindCount: 2,
  conflictingFilesCount: 2,
  semanticConflictsCount: 2,
  conflicts: mockMergeConflicts,
  semanticAlerts: mockSemanticAlerts,
};
