import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Tag, Descriptions, Timeline } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert } from '@/types/alert';
import { formatDate } from '@/utils/format';

const { Header, Content } = Layout;

const AlertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Mock data for demonstration
    const mockAlert: Alert = {
      id: id!,
      timestamp: Date.now() - 3600000,
      level: 'critical',
      title: 'High CPU Usage',
      message: 'Server CPU usage exceeded 90%',
      source: 'Server-1',
      status: 'pending',
      metadata: {
        'CPU Usage': '92%',
        'Process': 'web-server',
        'Duration': '30 minutes',
      },
    };
    setAlert(mockAlert);
  }, [id]);

  if (!alert) {
    return null;
  }

  const getLevelColor = (level: Alert['level']) => {
    switch (level) {
      case 'critical':
        return '#f5222d';
      case 'warning':
        return '#faad14';
      case 'info':
        return '#1890ff';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{ marginRight: 16 }}
        >
          Back to Dashboard
        </Button>
        <h1 style={{ margin: 0 }}>Alert Details</h1>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Card>
          <Descriptions title={alert.title} bordered>
            <Descriptions.Item label="Status">
              <Tag color={alert.status === 'pending' ? 'red' : 'green'}>
                {alert.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Level">
              <Tag color={getLevelColor(alert.level)}>
                {alert.level.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {formatDate(alert.timestamp)}
            </Descriptions.Item>
            <Descriptions.Item label="Source" span={2}>
              {alert.source}
            </Descriptions.Item>
            <Descriptions.Item label="Message" span={3}>
              {alert.message}
            </Descriptions.Item>
            {alert.metadata && Object.entries(alert.metadata).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {value}
              </Descriptions.Item>
            ))}
          </Descriptions>

          <Card title="Alert Timeline" style={{ marginTop: 24 }}>
            <Timeline mode="left">
              <Timeline.Item label={formatDate(alert.timestamp)}>
                Alert created
              </Timeline.Item>
              <Timeline.Item label={formatDate(alert.timestamp + 300000)}>
                Notification sent
              </Timeline.Item>
              <Timeline.Item label={formatDate(alert.timestamp + 600000)}>
                System attempted automatic recovery
              </Timeline.Item>
            </Timeline>
          </Card>
        </Card>
      </Content>
    </Layout>
  );
};

export default AlertDetail;
