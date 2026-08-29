import { CommunityIndicator, CommunityKpis } from "@/types/community";
import { MOCK_COMMUNITY_INDICATORS, MOCK_COMMUNITY_KPIS } from "./mock/mockCommunity";

export interface ICommunityService {
  getKpis(): Promise<CommunityKpis>;
  getIndicators(query?: string): Promise<CommunityIndicator[]>;
  getIndicatorById(id: string): Promise<CommunityIndicator | null>;
}

class MockCommunityService implements ICommunityService {
  async getKpis(): Promise<CommunityKpis> {
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_COMMUNITY_KPIS;
  }

  async getIndicators(query?: string): Promise<CommunityIndicator[]> {
    await new Promise((r) => setTimeout(r, 90));
    if (!query) return MOCK_COMMUNITY_INDICATORS;
    const q = query.toLowerCase();
    return MOCK_COMMUNITY_INDICATORS.filter(
      (ind) => ind.indicator.toLowerCase().includes(q) || ind.type.toLowerCase().includes(q)
    );
  }

  async getIndicatorById(id: string): Promise<CommunityIndicator | null> {
    await new Promise((r) => setTimeout(r, 80));
    return MOCK_COMMUNITY_INDICATORS.find((i) => i.id === id || i.indicator === id) || MOCK_COMMUNITY_INDICATORS[0];
  }
}

export const communityService: ICommunityService = new MockCommunityService();
