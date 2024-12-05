export interface InspectionTask {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime: number;
  endTime?: number;
  items: InspectionItem[];
  serverId: string;
  serverName: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  category: 'system' | 'service' | 'security' | 'performance';
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  metrics?: Record<string, number>;
}

export interface InspectionStats {
  total: number;
  success: number;
  failed: number;
  running: number;
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
}
