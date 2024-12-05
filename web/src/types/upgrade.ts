export interface UpgradePackage {
  id: string;
  name: string;
  version: string;
  description: string;
  releaseDate: number;
  status: 'available' | 'in_progress' | 'completed';
  type: 'security' | 'feature' | 'bugfix';
  size: number;
  affectedServers: string[];
}

export interface UpgradeTask {
  id: string;
  packageId: string;
  serverId: string;
  serverName: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime?: number;
  endTime?: number;
  errorMessage?: string;
}

export interface UpgradeStats {
  totalPackages: number;
  availablePackages: number;
  inProgressTasks: number;
  completedTasks: number;
  failedTasks: number;
}
