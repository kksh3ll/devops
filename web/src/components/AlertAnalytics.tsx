import React from 'react';
import { Card, Row, Col } from 'antd';
import ReactECharts from 'echarts-for-react';
import { Alert, AlertStats, AlertTrend } from '@/types/alert';

interface AlertAnalyticsProps {
  stats: AlertStats;
  trends: AlertTrend[];
}

const AlertAnalytics: React.FC<AlertAnalyticsProps> = ({ stats, trends }) => {
  const getPieOption = () => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
          },
        },
        data: [
          { 
            value: stats.pending, 
            name: 'Pending',
            itemStyle: { color: '#ff4d4f' }
          },
          { 
            value: stats.acknowledged, 
            name: 'Acknowledged',
            itemStyle: { color: '#faad14' }
          },
          { 
            value: stats.resolved, 
            name: 'Resolved',
            itemStyle: { color: '#52c41a' }
          },
        ],
      },
    ],
  });

  const getTrendOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Critical', 'Warning', 'Info'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: trends.map(t => t.date),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Critical',
        type: 'bar',
        stack: 'total',
        data: trends.map(t => t.critical),
        itemStyle: { color: '#ff4d4f' },
      },
      {
        name: 'Warning',
        type: 'bar',
        stack: 'total',
        data: trends.map(t => t.warning),
        itemStyle: { color: '#faad14' },
      },
      {
        name: 'Info',
        type: 'bar',
        stack: 'total',
        data: trends.map(t => t.info),
        itemStyle: { color: '#1890ff' },
      },
    ],
  });

  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card title="Alert Status Distribution">
          <ReactECharts option={getPieOption()} style={{ height: 400 }} />
        </Card>
      </Col>
      <Col span={12}>
        <Card title="Alert Trends (Last 7 Days)">
          <ReactECharts option={getTrendOption()} style={{ height: 400 }} />
        </Card>
      </Col>
    </Row>
  );
};

export default AlertAnalytics;
