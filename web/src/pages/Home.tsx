import React, { useEffect, useState } from 'react';
import { Layout, Card, Row, Col } from 'antd';
import TopologyGraph from '@/components/TopologyGraph';
import AlertCarousel from '@/components/AlertCarousel';
import AlertAnalytics from '@/components/AlertAnalytics';
import ResourceMonitor from '@/components/ResourceMonitor';
import UpgradeMonitor from '@/components/UpgradeMonitor';
import InspectionMonitor from '@/components/InspectionMonitor';
import { ServerNode } from '@/types/server';
import { Alert, AlertStats, AlertTrend } from '@/types/alert';
import { UpgradePackage, UpgradeTask, UpgradeStats } from '@/types/upgrade';
import { InspectionTask, InspectionStats } from '@/types/inspection';

const { Header, Content } = Layout;

const Home: React.FC = () => {
  const [servers, setServers] = useState<ServerNode[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats>({
    total: 0,
    pending: 0,
    acknowledged: 0,
    resolved: 0,
    byLevel: {
      critical: 0,
      warning: 0,
      info: 0,
    },
  });
  const [alertTrends, setAlertTrends] = useState<AlertTrend[]>([]);
  const [upgradePackages, setUpgradePackages] = useState<UpgradePackage[]>([]);
  const [upgradeTasks, setUpgradeTasks] = useState<UpgradeTask[]>([]);
  const [upgradeStats, setUpgradeStats] = useState<UpgradeStats>({
    totalPackages: 0,
    availablePackages: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
  });
  const [inspectionTasks, setInspectionTasks] = useState<InspectionTask[]>([]);
  const [inspectionStats, setInspectionStats] = useState<InspectionStats>({
    total: 0,
    success: 0,
    failed: 0,
    running: 0,
    lastDay: 0,
    lastWeek: 0,
    lastMonth: 0,
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    // Mock data for demonstration
    const mockServers: ServerNode[] = [
      {
        id: '1',
        name: 'Server 1',
        ip: '192.168.1.1',
        status: 'online',
        resources: {
          cpu: { usage: 45, total: 100 },
          memory: { usage: 60, total: 32768 },
          disk: { usage: 75, total: 1024000 },
        },
        loadAvg: [1.5, 1.2, 0.9],
        containers: [
          {
            id: 'c1',
            name: 'nginx',
            status: 'running',
            resources: { cpu: 20, memory: 30 },
          },
        ],
      },
      {
        id: '2',
        name: 'Server 2',
        ip: '192.168.1.2',
        status: 'warning',
        resources: {
          cpu: { usage: 85, total: 100 },
          memory: { usage: 75, total: 65536 },
          disk: { usage: 60, total: 2048000 },
        },
        loadAvg: [2.1, 1.8, 1.5],
        containers: [
          {
            id: 'c2',
            name: 'mysql',
            status: 'running',
            resources: { cpu: 40, memory: 50 },
          },
        ],
      },
      {
        id: '3',
        name: 'Server 3',
        ip: '192.168.1.3',
        status: 'online',
        resources: {
          cpu: { usage: 30, total: 100 },
          memory: { usage: 45, total: 16384 },
          disk: { usage: 55, total: 512000 },
        },
        loadAvg: [0.8, 0.7, 0.6],
        containers: [
          {
            id: 'c3',
            name: 'redis',
            status: 'running',
            resources: { cpu: 15, memory: 25 },
          },
        ],
      },
    ];

    const mockAlerts: Alert[] = [
      {
        id: '1',
        timestamp: Date.now() - 3600000,
        level: 'critical',
        title: 'High CPU Usage',
        message: 'Server CPU usage exceeded 90%',
        source: 'Server-1',
        status: 'pending',
      },
      {
        id: '2',
        timestamp: Date.now() - 7200000,
        level: 'warning',
        title: 'Memory Usage Warning',
        message: 'Memory usage reached 80%',
        source: 'Server-2',
        status: 'pending',
      },
      {
        id: '3',
        timestamp: Date.now() - 10800000,
        level: 'info',
        title: 'Container Started',
        message: 'New container instance started successfully',
        source: 'Container-1',
        status: 'pending',
      },
    ];

    const mockStats: AlertStats = {
      total: 100,
      pending: 30,
      acknowledged: 20,
      resolved: 50,
      byLevel: {
        critical: 15,
        warning: 35,
        info: 50,
      },
    };

    const mockTrends: AlertTrend[] = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString(),
        critical: Math.floor(Math.random() * 10),
        warning: Math.floor(Math.random() * 20),
        info: Math.floor(Math.random() * 30),
      };
    });

    const mockUpgradePackages: UpgradePackage[] = [
      {
        id: '1',
        name: 'Security Patch 2023.1',
        version: '1.0.0',
        description: 'Critical security update',
        releaseDate: Date.now() - 86400000,
        status: 'available',
        type: 'security',
        size: 1024 * 1024 * 50, // 50MB
        affectedServers: ['server1', 'server2'],
      },
      {
        id: '2',
        name: 'Feature Update 2023.2',
        version: '2.0.0',
        description: 'New features and improvements',
        releaseDate: Date.now() - 172800000,
        status: 'in_progress',
        type: 'feature',
        size: 1024 * 1024 * 100, // 100MB
        affectedServers: ['server1', 'server3'],
      },
    ];

    const mockUpgradeTasks: UpgradeTask[] = [
      {
        id: '1',
        packageId: '1',
        serverId: 'server1',
        serverName: 'Server 1',
        status: 'running',
        startTime: Date.now() - 3600000,
      },
      {
        id: '2',
        packageId: '1',
        serverId: 'server2',
        serverName: 'Server 2',
        status: 'failed',
        startTime: Date.now() - 7200000,
        endTime: Date.now() - 3600000,
        errorMessage: 'Connection timeout',
      },
    ];

    const mockUpgradeStats: UpgradeStats = {
      totalPackages: 5,
      availablePackages: 2,
      inProgressTasks: 1,
      completedTasks: 10,
      failedTasks: 1,
    };

    const mockInspectionTasks: InspectionTask[] = [
      {
        id: '1',
        name: 'Daily System Check',
        type: 'daily',
        status: 'success',
        startTime: Date.now() - 3600000,
        endTime: Date.now() - 3500000,
        serverId: 'server1',
        serverName: 'Server 1',
        items: [
          {
            id: '1-1',
            name: 'Disk Space Check',
            category: 'system',
            status: 'success',
            message: 'All disk space within limits',
          },
          {
            id: '1-2',
            name: 'Service Status Check',
            category: 'service',
            status: 'success',
            message: 'All services running',
          },
        ],
      },
      {
        id: '2',
        name: 'Weekly Security Scan',
        type: 'weekly',
        status: 'running',
        startTime: Date.now() - 1800000,
        serverId: 'server2',
        serverName: 'Server 2',
        items: [
          {
            id: '2-1',
            name: 'Vulnerability Scan',
            category: 'security',
            status: 'success',
            message: 'No vulnerabilities found',
          },
          {
            id: '2-2',
            name: 'Port Scan',
            category: 'security',
            status: 'running',
          },
        ],
      },
    ];

    const mockInspectionStats: InspectionStats = {
      total: 100,
      success: 85,
      failed: 10,
      running: 5,
      lastDay: 10,
      lastWeek: 50,
      lastMonth: 200,
    };

    setServers(mockServers);
    setAlerts(mockAlerts);
    setAlertStats(mockStats);
    setAlertTrends(mockTrends);
    setUpgradePackages(mockUpgradePackages);
    setUpgradeTasks(mockUpgradeTasks);
    setUpgradeStats(mockUpgradeStats);
    setInspectionTasks(mockInspectionTasks);
    setInspectionStats(mockInspectionStats);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <h1>DevOps Monitoring Dashboard</h1>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Active Alerts" bodyStyle={{ padding: 0 }}>
              <AlertCarousel alerts={alerts} />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={24}>
            <ResourceMonitor servers={servers} />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={12}>
            <UpgradeMonitor
              packages={upgradePackages}
              tasks={upgradeTasks}
              stats={upgradeStats}
            />
          </Col>
          <Col span={12}>
            <InspectionMonitor
              tasks={inspectionTasks}
              stats={inspectionStats}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={24}>
            <AlertAnalytics stats={alertStats} trends={alertTrends} />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card title="Infrastructure Topology">
              <TopologyGraph servers={servers} />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Home;
