export interface Alert {
  id: string;
  timestamp: number;
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  source: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  metadata?: Record<string, string>;
}

export interface AlertStats {
  total: number;
  pending: number;
  acknowledged: number;
  resolved: number;
  byLevel: {
    critical: number;
    warning: number;
    info: number;
  };
}

export interface AlertTrend {
  date: string;
  critical: number;
  warning: number;
  info: number;
}
