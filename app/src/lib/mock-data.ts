import type { Plan } from './types';

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    credits: 500,
    features: ['500 URL credits/mo', '3 active campaigns', 'Ping endpoint strategy', 'CSV import', 'Basic analytics', 'Admin support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    credits: 2000,
    isPopular: true,
    features: ['2,000 URL credits/mo', 'Unlimited campaigns', 'Ping + IndexNow strategies', 'CSV import + API access', 'Advanced analytics', 'API key authentication'],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 199,
    credits: 10000,
    features: ['10,000 URL credits/mo', 'Unlimited campaigns', 'Ping + IndexNow strategies', 'Bulk campaign operations', 'Admin-managed users', 'Priority operations support'],
  },
];

export const STRATEGY_INFO = {
  ping: {
    label: 'Ping Submission',
    description: 'Submits URLs to configured ping endpoints to trigger crawl discovery.',
    icon: '📡',
    color: '#06b6d4',
  },
  indexnow: {
    label: 'IndexNow Submission',
    description: 'Submits URLs to IndexNow for verified domains when provider credentials are configured.',
    icon: '🗺️',
    color: '#10b981',
  },
  apiKeys: {
    label: 'API Key Intake',
    description: 'Accepts authenticated campaign submissions from external systems.',
    icon: '🔌',
    color: '#6366f1',
  },
  dryRun: {
    label: 'Dry-Run Validation',
    description: 'Validates local URL processing without pretending a live provider accepted the request.',
    icon: '🔗',
    color: '#f59e0b',
  },
};
