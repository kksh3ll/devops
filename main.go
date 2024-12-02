package main

import (
	"log"
	"devops/internal/config"
	"devops/internal/monitor"
	"devops/internal/alert"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize alert manager
	alertManager := alert.NewManager(cfg.Alert)

	// Initialize monitors
	monitors := []monitor.Monitor{
		monitor.NewServerMonitor(cfg.ServerMonitoring, alertManager),
		monitor.NewContainerMonitor(cfg.ContainerMonitoring, alertManager),
	}

	// Start monitoring
	monitor.StartMonitoring(monitors, cfg.Monitoring.Interval)
}
