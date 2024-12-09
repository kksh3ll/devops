package monitor

import (
	"time"
)

// Monitor interface defines the basic monitoring functionality
type Monitor interface {
	Start() error
	Stop() error
	IsEnabled() bool
}

// StartMonitoring starts all enabled monitors with the specified interval
func StartMonitoring(monitors []Monitor, intervalSeconds int) {
	ticker := time.NewTicker(time.Duration(intervalSeconds) * time.Second)
	defer ticker.Stop()

	// 创建一个无限循环
	for {
		// 执行所有启用的监控器
		for _, m := range monitors {
			if m.IsEnabled() {
				if err := m.Start(); err != nil {
					continue
				}
			}
		}

		// 等待下一个时间间隔
		<-ticker.C
	}
}
