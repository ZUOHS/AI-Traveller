import { describe, it, expect } from 'vitest';

import { generateItineraryPlan, generateBudgetPlan } from '../aiService.js';

describe('aiService fallbacks', () => {
  it('returns a fallback itinerary when LLM is not configured', async () => {
    const result = await generateItineraryPlan({
      destination: '东京',
      tripLength: 3
    });
    expect(result.summary).toContain('东京');
    expect(result.days.length).toBeGreaterThan(0);
  });

  it('returns a fallback budget when LLM is not configured', async () => {
    const result = await generateBudgetPlan({
      destination: '东京',
      budget: 8000,
      tripLength: 5
    });
    expect(result.total).toBeGreaterThan(0);
    expect(result.breakdown.length).toBeGreaterThan(0);
  });
});
