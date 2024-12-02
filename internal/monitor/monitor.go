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

	for _, m := range monitors {
		if m.IsEnabled() {
			if err := m.Start(); err != nil {
				continue
			}
		}
	}

	for range ticker.C {
		for _, m := range monitors {
			if m.IsEnabled() {
				if err := m.Start(); err != nil {
					continue
				}
			}
		}
	}
}
