import { CommunityIndicator, CommunityKpis } from "@/types/community";
import { apiClient } from "./api/apiClient";

export interface ICommunityService {
  getKpis(): Promise<CommunityKpis>;
  getIndicators(query?: string): Promise<CommunityIndicator[]>;
  getIndicatorById(id: string): Promise<CommunityIndicator | null>;
  blockIndicator(indicator: string, blocked: boolean): Promise<boolean>;
}

class ProductionCommunityService implements ICommunityService {
  async getIndicators(query?: string): Promise<CommunityIndicator[]> {
    try {
      const feed = await apiClient.getCommunityFeed(50);
      let list: CommunityIndicator[] = (feed.items || []).map((item, idx) => {
        const typeStr = (item.indicator_type || "URL").toUpperCase();
        const typeFormatted = typeStr === "URL" ? "URL" : typeStr === "DOMAIN" ? "Domain" : "URL";
        const riskNorm = (item.risk_tier || "suspicious").toLowerCase();
        const riskCapitalized = (riskNorm.charAt(0).toUpperCase() + riskNorm.slice(1)) as any;
        const status = riskNorm === "critical" || riskNorm === "high" ? "Malicious" : riskNorm === "suspicious" ? "Suspicious" : "Safe";

        const firstSeenFmt = item.first_seen ? item.first_seen.replace("T", " ").replace(/\.\d+.*$/, "") : "Recently";
        const lastSeenFmt = item.last_seen ? item.last_seen.replace("T", " ").replace(/\.\d+.*$/, "") : undefined;

        return {
          id: `IOC-${idx + 1}`,
          indicator: item.indicator,
          type: typeFormatted,
          reportsCount: item.report_count,
          firstSeen: firstSeenFmt,
          lastSeen: lastSeenFmt,
          risk: riskCapitalized,
          status,
          isBlocked: !!item.is_blocked,
        };
      });

      if (query) {
        const q = query.toLowerCase();
        list = list.filter(
          (i) =>
            i.indicator.toLowerCase().includes(q) ||
            i.type.toLowerCase().includes(q) ||
            i.risk.toLowerCase().includes(q)
        );
      }

      return list;
    } catch (err) {
      console.warn("Could not load community feed from backend:", err);
      throw err;
    }
  }

  async getKpis(): Promise<CommunityKpis> {
    try {
      const indicators = await this.getIndicators();
      const urlCount = indicators.filter((i) => i.type === "URL").length;
      const domainCount = indicators.filter((i) => i.type === "Domain").length;
      const totalReports = indicators.reduce((acc, i) => acc + i.reportsCount, 0);

      return {
        urlCount: urlCount.toString(),
        urlChange: "",
        domainCount: domainCount.toString(),
        domainChange: "",
        phoneCount: "0",
        phoneChange: "",
        upiCount: "0",
        upiChange: "",
        emailCount: totalReports.toString(),
        emailChange: "",
      };
    } catch (err) {
      return {
        urlCount: "0",
        urlChange: "",
        domainCount: "0",
        domainChange: "",
        phoneCount: "0",
        phoneChange: "",
        upiCount: "0",
        upiChange: "",
        emailCount: "0",
        emailChange: "",
      };
    }
  }

  async getIndicatorById(id: string): Promise<CommunityIndicator | null> {
    const list = await this.getIndicators();
    return list.find((i) => i.id === id || i.indicator === id) || (list.length > 0 ? list[0] : null);
  }

  async blockIndicator(indicator: string, blocked: boolean): Promise<boolean> {
    try {
      const res = await apiClient.blockIndicator(indicator, blocked);
      return res.success;
    } catch (err) {
      console.error("Failed to update indicator block state:", err);
      throw err;
    }
  }
}

export const communityService: ICommunityService = new ProductionCommunityService();
