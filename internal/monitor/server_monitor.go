package monitor

import (
	"devops/internal/alert"
	"devops/internal/config"
	"fmt"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
)

type ServerMonitor struct {
	config       config.ServerMonitorConfig
	alertManager *alert.Manager
}

func NewServerMonitor(config config.ServerMonitorConfig, alertManager *alert.Manager) *ServerMonitor {
	return &ServerMonitor{
		config:       config,
		alertManager: alertManager,
	}
}

func (s *ServerMonitor) Start() error {
	// Monitor CPU usage
	cpuPercent, err := cpu.Percent(0, false)
	if err == nil && len(cpuPercent) > 0 {
		if cpuPercent[0] > s.config.CPUThreshold {
			s.alertManager.CreateAlert(fmt.Sprintf("High CPU usage: %.2f%%", cpuPercent[0]), alert.SeverityMedium)
		}
	}

	// Monitor memory usage
	memInfo, err := mem.VirtualMemory()
	if err == nil {
		if memInfo.UsedPercent > s.config.MemoryThreshold {
			s.alertManager.CreateAlert(fmt.Sprintf("High Memory usage: %.2f%%", memInfo.UsedPercent), alert.SeverityMedium)
		}
	}

	// Monitor disk usage
	partitions, err := disk.Partitions(false)
	if err == nil {
		for _, partition := range partitions {
			usage, err := disk.Usage(partition.Mountpoint)
			if err == nil {
				if usage.UsedPercent > s.config.DiskThreshold {
					s.alertManager.CreateAlert(fmt.Sprintf("High Disk usage on %s: %.2f%%",
						partition.Mountpoint, usage.UsedPercent), alert.SeverityMedium)
				}
			}
		}
	}

	return nil
}

func (s *ServerMonitor) Stop() error {
	return nil
}

func (s *ServerMonitor) IsEnabled() bool {
	return s.config.Enabled
}
