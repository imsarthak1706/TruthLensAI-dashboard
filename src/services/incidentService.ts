import { IncidentDetail, IncidentItem, IncidentKpis } from "@/types/incident";
import { MOCK_INCIDENT_DETAIL_INC4092, MOCK_INCIDENT_KPIS, MOCK_INCIDENTS_LIST } from "./mock/mockIncidents";

export interface IIncidentService {
  getKpis(): Promise<IncidentKpis>;
  getIncidents(): Promise<IncidentItem[]>;
  getIncidentById(id: string): Promise<IncidentDetail | null>;
  updateIncidentStatus(id: string, status: "open" | "investigating" | "resolved"): Promise<void>;
}

class MockIncidentService implements IIncidentService {
  async getKpis(): Promise<IncidentKpis> {
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_INCIDENT_KPIS;
  }

  async getIncidents(): Promise<IncidentItem[]> {
    await new Promise((r) => setTimeout(r, 80));
    return MOCK_INCIDENTS_LIST;
  }

  async getIncidentById(id: string): Promise<IncidentDetail | null> {
    await new Promise((r) => setTimeout(r, 100));
    if (id === "INC-4092" || !id) {
      return MOCK_INCIDENT_DETAIL_INC4092;
    }
    const found = MOCK_INCIDENTS_LIST.find((i) => i.id === id);
    if (found) {
      return {
        ...MOCK_INCIDENT_DETAIL_INC4092,
        id: found.id,
        timestamp: found.timestamp,
        threatType: found.threatType,
        platform: found.platform,
        severity: found.severity,
        status: found.status,
        analyst: found.analyst,
        description: found.description || MOCK_INCIDENT_DETAIL_INC4092.description,
      };
    }
    return MOCK_INCIDENT_DETAIL_INC4092;
  }

  async updateIncidentStatus(id: string, status: "open" | "investigating" | "resolved"): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const target = MOCK_INCIDENTS_LIST.find((i) => i.id === id);
    if (target) {
      target.status = status;
    }
  }
}

export const incidentService: IIncidentService = new MockIncidentService();
