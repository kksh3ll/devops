export interface ServerNode {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning';
  resources: {
    cpu: {
      usage: number;
      total: number;
    };
    memory: {
      usage: number;
      total: number;
    };
    disk: {
      usage: number;
      total: number;
    };
  };
  containers: Container[];
}

export interface Container {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  resources: {
    cpu: number;
    memory: number;
  };
}

export interface TimeSeriesData {
  timestamp: number;
  value: number;
}

export interface ResourceHistory {
  cpu: TimeSeriesData[];
  memory: TimeSeriesData[];
  disk: TimeSeriesData[];
}
