import React from 'react';
import { Card, Table, Tag, Progress, Row, Col, Statistic } from 'antd';
import type { InspectionTask, InspectionStats } from '@/types/inspection';
import { formatDate } from '@/utils/format';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';

interface InspectionMonitorProps {
  tasks: InspectionTask[];
  stats: InspectionStats;
}

const InspectionMonitor: React.FC<InspectionMonitorProps> = ({
  tasks,
  stats,
}) => {
  const getStatusIcon = (status: InspectionTask['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'running':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: InspectionTask['type']) => {
    switch (type) {
      case 'daily':
        return 'blue';
      case 'weekly':
        return 'purple';
      case 'monthly':
        return 'cyan';
      case 'custom':
        return 'orange';
    }
  };

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: InspectionTask) => (
        <>
          <span style={{ marginRight: 8 }}>{text}</span>
          <Tag color={getTypeColor(record.type)}>{record.type}</Tag>
        </>
      ),
    },
    {
      title: 'Server',
      dataIndex: 'serverName',
      key: 'serverName',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: number) => formatDate(time),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: InspectionTask['status'], record: InspectionTask) => {
        const successCount = record.items.filter(item => item.status === 'success').length;
        const totalCount = record.items.length;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {getStatusIcon(status)}
            <span style={{ marginRight: 8 }}>{status.toUpperCase()}</span>
            <Progress
              percent={Math.round((successCount / totalCount) * 100)}
              size="small"
              style={{ width: 100 }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card title="System Inspection">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Inspections"
              value={stats.total}
              suffix={`/ ${stats.lastDay} today`}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Success Rate"
              value={Math.round((stats.success / stats.total) * 100)}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Inspections"
              value={stats.running}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>
      <Card title="Recent Inspection Tasks" style={{ marginTop: 16 }}>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          expandable={{
            expandedRowRender: (record: InspectionTask) => (
              <Table
                dataSource={record.items}
                columns={[
                  {
                    title: 'Item',
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: 'Category',
                    dataIndex: 'category',
                    key: 'category',
                    render: (category: string) => (
                      <Tag>{category.toUpperCase()}</Tag>
                    ),
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string, item: any) => (
                      <Tag color={
                        status === 'success' ? 'success' :
                        status === 'failed' ? 'error' :
                        'default'
                      }>
                        {status.toUpperCase()}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Message',
                    dataIndex: 'message',
                    key: 'message',
                  },
                ]}
                rowKey="id"
                pagination={false}
              />
            ),
          }}
        />
      </Card>
    </Card>
  );
};

export default InspectionMonitor;
