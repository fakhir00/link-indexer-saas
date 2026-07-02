import { urlRepository } from '../repositories';

const billingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    monthlyCredits: 500,
    features: ['500 URL credits/mo', '3 active campaigns', 'Ping endpoint strategy', 'CSV import', 'Basic analytics', 'Admin support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    monthlyCredits: 2000,
    features: ['2,000 URL credits/mo', 'Unlimited campaigns', 'Ping + IndexNow strategies', 'CSV import + API access', 'Advanced analytics', 'API key authentication'],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 199,
    monthlyCredits: 10000,
    features: ['10,000 URL credits/mo', 'Unlimited campaigns', 'Ping + IndexNow strategies', 'Bulk campaign operations', 'Admin-managed users', 'Priority operations support'],
  },
] as const;

export const billingService = {
  getPlans() {
    return billingPlans;
  },

  async getOverview() {
    const currentPlan = billingPlans[0];
    const now = new Date();
    const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const usedThisMonth = await urlRepository.count({
      createdAt: { gte: cycleStart, lt: cycleEnd },
    });

    return {
      currentPlan,
      credits: {
        currentBalance: Math.max(currentPlan.monthlyCredits - usedThisMonth, 0),
        usedThisMonth,
        monthlyAllowance: currentPlan.monthlyCredits,
        cycleEnd,
      },
    };
  },
};
