import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { ServerNode } from '@/types/server';
import type { EChartsOption } from 'echarts';
import { Modal, Card, Progress, Tabs } from 'antd';
import { formatBytes } from '@/utils/format';

interface TopologyGraphProps {
  servers: ServerNode[];
  onNodeClick?: (node: ServerNode) => void;
}

const TopologyGraph: React.FC<TopologyGraphProps> = ({ servers, onNodeClick }) => {
  const [selectedNode, setSelectedNode] = useState<ServerNode | null>(null);

  const getNodeColor = (status: ServerNode['status']) => {
    switch (status) {
      case 'online':
        return '#52c41a';
      case 'offline':
        return '#ff4d4f';
      case 'warning':
        return '#faad14';
      default:
        return '#d9d9d9';
    }
  };

  const getOption = (): EChartsOption => {
    const nodes = servers.map((server) => ({
      id: server.id,
      name: server.name,
      value: [
        Math.random() * 100,
        Math.random() * 100,
        server.resources.cpu.usage,
        server.resources.memory.usage,
        server.resources.disk.usage,
      ],
      itemStyle: {
        color: getNodeColor(server.status),
      },
      symbolSize: 50,
    }));

    const edges = servers.reduce<any[]>((acc, server, index) => {
      if (index < servers.length - 1) {
        acc.push({
          source: server.id,
          target: servers[index + 1].id,
        });
      }
      return acc;
    }, []);

    return {
      tooltip: {
        formatter: (params: any) => {
          const server = servers.find((s) => s.id === params.data.id);
          if (!server) return '';
          return `
            <div>
              <strong>${server.name}</strong><br/>
              IP: ${server.ip}<br/>
              CPU: ${server.resources.cpu.usage}%<br/>
              Memory: ${server.resources.memory.usage}%<br/>
              Disk: ${server.resources.disk.usage}%
            </div>
          `;
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: edges,
          roam: true,
          label: {
            show: true,
            position: 'bottom',
            formatter: '{b}',
          },
          force: {
            repulsion: 1000,
            edgeLength: 200,
          },
          emphasis: {
            focus: 'adjacency',
          },
        },
      ],
    };
  };

  const handleNodeClick = (params: any) => {
    const server = servers.find((s) => s.id === params.data.id);
    if (server) {
      setSelectedNode(server);
      onNodeClick?.(server);
    }
  };

  const handleModalClose = () => {
    setSelectedNode(null);
  };

  return (
    <>
      <ReactECharts
        option={getOption()}
        style={{ height: '600px' }}
        onEvents={{
          click: handleNodeClick,
        }}
      />
      <Modal
        title={`Server Details: ${selectedNode?.name}`}
        open={!!selectedNode}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedNode && (
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Resources" key="1">
              <Card>
                <h4>CPU Usage</h4>
                <Progress
                  percent={selectedNode.resources.cpu.usage}
                  status={selectedNode.resources.cpu.usage > 80 ? 'exception' : 'normal'}
                />
                <h4>Memory Usage</h4>
                <Progress
                  percent={selectedNode.resources.memory.usage}
                  status={selectedNode.resources.memory.usage > 80 ? 'exception' : 'normal'}
                />
                <h4>Disk Usage</h4>
                <Progress
                  percent={selectedNode.resources.disk.usage}
                  status={selectedNode.resources.disk.usage > 80 ? 'exception' : 'normal'}
                />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Containers" key="2">
              {selectedNode.containers.map((container) => (
                <Card key={container.id} style={{ marginBottom: 16 }}>
                  <h4>{container.name}</h4>
                  <p>Status: {container.status}</p>
                  <Progress
                    percent={container.resources.cpu}
                    size="small"
                    format={(percent) => `CPU: ${percent}%`}
                  />
                  <Progress
                    percent={container.resources.memory}
                    size="small"
                    format={(percent) => `Memory: ${percent}%`}
                  />
                </Card>
              ))}
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>
    </>
  );
};

export default TopologyGraph;
