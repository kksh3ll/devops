import React, { useState } from 'react';
import { Card, Row, Col, Table, Progress, Radio, Tooltip } from 'antd';
import type { RadioChangeEvent } from 'antd';
import ReactECharts from 'echarts-for-react';
import { ServerNode } from '@/types/server';
import { formatBytes } from '@/utils/format';

interface ResourceMonitorProps {
  servers: ServerNode[];
}

const ResourceMonitor: React.FC<ResourceMonitorProps> = ({ servers }) => {
  const [sortBy, setSortBy] = useState<'cpu' | 'memory'>('cpu');

  const handleSortChange = (e: RadioChangeEvent) => {
    setSortBy(e.target.value);
  };

  const getGaugeOption = (title: string, value: number) => ({
    title: {
      text: title,
      left: 'center',
    },
    series: [
      {
        type: 'gauge',
        progress: {
          show: true,
          width: 18,
        },
        axisLine: {
          lineStyle: {
            width: 18,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: 15,
          lineStyle: {
            width: 2,
            color: '#999',
          },
        },
        pointer: {
          show: false,
        },
        anchor: {
          show: false,
        },
        title: {
          fontSize: 14,
        },
        detail: {
          valueAnimation: true,
          fontSize: 14,
          offsetCenter: [0, '70%'],
        },
        data: [
          {
            value: value,
            name: `${value}%`,
          },
        ],
      },
    ],
  });

  const columns = [
    {
      title: 'Server',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ServerNode) => (
        <Tooltip title={`IP: ${record.ip}`}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'CPU Usage',
      dataIndex: ['resources', 'cpu', 'usage'],
      key: 'cpu',
      sorter: (a: ServerNode, b: ServerNode) => 
        a.resources.cpu.usage - b.resources.cpu.usage,
      render: (value: number) => (
        <Progress 
          percent={value} 
          size="small"
          status={value > 80 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: 'Memory Usage',
      dataIndex: ['resources', 'memory', 'usage'],
      key: 'memory',
      sorter: (a: ServerNode, b: ServerNode) => 
        a.resources.memory.usage - b.resources.memory.usage,
      render: (value: number, record: ServerNode) => (
        <Tooltip title={`${formatBytes(record.resources.memory.usage * record.resources.memory.total / 100)} / ${formatBytes(record.resources.memory.total)}`}>
          <Progress 
            percent={value} 
            size="small"
            status={value > 80 ? 'exception' : 'normal'}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Disk Usage',
      dataIndex: ['resources', 'disk', 'usage'],
      key: 'disk',
      sorter: (a: ServerNode, b: ServerNode) => 
        a.resources.disk.usage - b.resources.disk.usage,
      render: (value: number, record: ServerNode) => (
        <Tooltip title={`${formatBytes(record.resources.disk.usage * record.resources.disk.total / 100)} / ${formatBytes(record.resources.disk.total)}`}>
          <Progress 
            percent={value} 
            size="small"
            status={value > 80 ? 'exception' : 'normal'}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Load Average',
      dataIndex: 'loadAvg',
      key: 'loadAvg',
      render: (loadAvg: number[]) => (
        <span>{loadAvg ? loadAvg.join(' / ') : 'N/A'}</span>
      ),
    },
  ];

  const getTopServers = () => {
    return [...servers]
      .sort((a, b) => {
        if (sortBy === 'cpu') {
          return b.resources.cpu.usage - a.resources.cpu.usage;
        }
        return b.resources.memory.usage - a.resources.memory.usage;
      })
      .slice(0, 5);
  };

  const getResourceChartOption = () => {
    const topServers = getTopServers();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['CPU Usage', 'Memory Usage'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        max: 100,
      },
      yAxis: {
        type: 'category',
        data: topServers.map(server => server.name),
      },
      series: [
        {
          name: 'CPU Usage',
          type: 'bar',
          data: topServers.map(server => server.resources.cpu.usage),
          itemStyle: { color: '#1890ff' },
        },
        {
          name: 'Memory Usage',
          type: 'bar',
          data: topServers.map(server => server.resources.memory.usage),
          itemStyle: { color: '#52c41a' },
        },
      ],
    };
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Resource Usage Overview">
            <Table 
              dataSource={servers} 
              columns={columns} 
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card 
            title="Resource Usage Ranking"
            extra={
              <Radio.Group value={sortBy} onChange={handleSortChange}>
                <Radio.Button value="cpu">CPU</Radio.Button>
                <Radio.Button value="memory">Memory</Radio.Button>
              </Radio.Group>
            }
          >
            <ReactECharts option={getResourceChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="System Load">
            <Row gutter={[16, 16]}>
              {servers.slice(0, 4).map(server => (
                <Col span={12} key={server.id}>
                  <Card size="small" title={server.name}>
                    <ReactECharts 
                      option={getGaugeOption('CPU Usage', server.resources.cpu.usage)}
                      style={{ height: 200 }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ResourceMonitor;
