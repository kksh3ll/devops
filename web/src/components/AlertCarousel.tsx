import React from 'react';
import { Carousel, Tag, Card } from 'antd';
import { Alert } from '@/types/alert';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/format';

interface AlertCarouselProps {
  alerts: Alert[];
}

const AlertCarousel: React.FC<AlertCarouselProps> = ({ alerts }) => {
  const navigate = useNavigate();

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

  const handleAlertClick = (alertId: string) => {
    navigate(`/alerts/${alertId}`);
  };

  return (
    <Carousel
      autoplay
      dots={false}
      autoplaySpeed={5000}
      style={{ background: '#001529', padding: '20px' }}
    >
      {alerts.map((alert) => (
        <div key={alert.id}>
          <Card
            hoverable
            onClick={() => handleAlertClick(alert.id)}
            style={{ margin: '0 12px', background: '#f0f2f5' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Tag color={getLevelColor(alert.level)} style={{ marginRight: 12 }}>
                  {alert.level.toUpperCase()}
                </Tag>
                <span style={{ fontSize: 16, fontWeight: 'bold' }}>{alert.title}</span>
              </div>
              <span style={{ color: '#8c8c8c' }}>{formatDate(alert.timestamp)}</span>
            </div>
            <p style={{ margin: '12px 0 0', color: '#595959' }}>{alert.message}</p>
            <div style={{ marginTop: 8 }}>
              <Tag>{alert.source}</Tag>
              {alert.metadata &&
                Object.entries(alert.metadata).map(([key, value]) => (
                  <Tag key={key}>{`${key}: ${value}`}</Tag>
                ))}
            </div>
          </Card>
        </div>
      ))}
    </Carousel>
  );
};

export default AlertCarousel;
