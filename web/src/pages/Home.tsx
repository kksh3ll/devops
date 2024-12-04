import React, { useEffect, useState } from 'react';
import { Layout, Card, Statistic, Row, Col, Select } from 'antd';
import { ServerNode } from '@/types/server';
import TopologyGraph from '@/components/TopologyGraph';
import ReactECharts from 'echarts-for-react';
import { formatDate } from '@/utils/format';

const { Header, Content } = Layout;
const { Option } = Select;

const Home: React.FC = () => {
  const [servers, setServers] = useState<ServerNode[]>([]);
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [selectedServer, setSelectedServer] = useState<ServerNode | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
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
        containers: [
          {
            id: 'c1',
            name: 'nginx',
            status: 'running',
            resources: { cpu: 20, memory: 30 },
          },
        ],
      },
      // Add more mock servers as needed
    ];
    setServers(mockServers);
  }, []);

  const getTimeSeriesOption = () => {
    if (!selectedServer) return {};

    const now = Date.now();
    const timeRangeMap: { [key: string]: number } = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };

    const generateMockData = () => {
      const data = [];
      const interval = timeRangeMap[timeRange];
      const points = 50;
      const step = interval / points;

      for (let i = 0; i < points; i++) {
        data.push([
          now - interval + i * step,
          Math.random() * 100,
        ]);
      }
      return data;
    };

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const time = formatDate(params[0].value[0]);
          return `${time}<br/>${params[0].seriesName}: ${params[0].value[1].toFixed(2)}%`;
        },
      },
      xAxis: {
        type: 'time',
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
      },
      series: [
        {
          name: 'CPU Usage',
          type: 'line',
          smooth: true,
          data: generateMockData(),
        },
      ],
    };
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <h1>Server Monitoring Dashboard</h1>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <TopologyGraph
                servers={servers}
                onNodeClick={(server) => setSelectedServer(server)}
              />
            </Card>
          </Col>
        </Row>
        {selectedServer && (
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Card
                title={`Resource Usage History - ${selectedServer.name}`}
                extra={
                  <Select
                    value={timeRange}
                    onChange={setTimeRange}
                    style={{ width: 120 }}
                  >
                    <Option value="1h">Last 1 hour</Option>
                    <Option value="6h">Last 6 hours</Option>
                    <Option value="24h">Last 24 hours</Option>
                  </Select>
                }
              >
                <ReactECharts option={getTimeSeriesOption()} style={{ height: '400px' }} />
              </Card>
            </Col>
          </Row>
        )}
      </Content>
    </Layout>
  );
};

export default Home;
