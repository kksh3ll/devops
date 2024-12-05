import React from 'react';
import { Card, Table, Tag, Progress, Tooltip, Badge, Space, Statistic } from 'antd';
import type { UpgradePackage, UpgradeTask, UpgradeStats } from '@/types/upgrade';
import { formatBytes, formatDate } from '@/utils/format';

interface UpgradeMonitorProps {
  packages: UpgradePackage[];
  tasks: UpgradeTask[];
  stats: UpgradeStats;
}

const UpgradeMonitor: React.FC<UpgradeMonitorProps> = ({
  packages,
  tasks,
  stats,
}) => {
  const getTypeColor = (type: UpgradePackage['type']) => {
    switch (type) {
      case 'security':
        return 'red';
      case 'feature':
        return 'blue';
      case 'bugfix':
        return 'orange';
    }
  };

  const getStatusColor = (status: UpgradeTask['status']) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'running':
        return 'processing';
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
    }
  };

  const packageColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: UpgradePackage) => (
        <Space direction="vertical" size={0}>
          <span>{text}</span>
          <Tag color={getTypeColor(record.type)}>{record.type.toUpperCase()}</Tag>
        </Space>
      ),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Release Date',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (date: number) => formatDate(date),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatBytes(size),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: UpgradePackage['status']) => {
        const statusMap = {
          available: { text: 'Available', color: 'green' },
          in_progress: { text: 'In Progress', color: 'blue' },
          completed: { text: 'Completed', color: 'gray' },
        };
        return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
      },
    },
    {
      title: 'Affected Servers',
      dataIndex: 'affectedServers',
      key: 'affectedServers',
      render: (servers: string[]) => `${servers.length} servers`,
    },
  ];

  const taskColumns = [
    {
      title: 'Server',
      dataIndex: 'serverName',
      key: 'serverName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: UpgradeTask['status'], record: UpgradeTask) => (
        <Tooltip title={record.errorMessage}>
          <Badge status={getStatusColor(status)} text={status.toUpperCase()} />
        </Tooltip>
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time?: number) => (time ? formatDate(time) : '-'),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time?: number) => (time ? formatDate(time) : '-'),
    },
  ];

  return (
    <Card title="System Upgrades">
      <Card type="inner" title="Upgrade Statistics">
        <Space size="large">
          <Statistic title="Total Packages" value={stats.totalPackages} />
          <Statistic title="Available" value={stats.availablePackages} />
          <Statistic title="In Progress" value={stats.inProgressTasks} />
          <Statistic title="Completed" value={stats.completedTasks} />
          <Statistic title="Failed" value={stats.failedTasks} />
        </Space>
      </Card>
      <Card
        type="inner"
        title="Available Packages"
        style={{ marginTop: '16px' }}
      >
        <Table
          dataSource={packages}
          columns={packageColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>
      <Card
        type="inner"
        title="Recent Upgrade Tasks"
        style={{ marginTop: '16px' }}
      >
        <Table
          dataSource={tasks}
          columns={taskColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </Card>
  );
};

export default UpgradeMonitor;
