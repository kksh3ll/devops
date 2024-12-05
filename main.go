package main

import (
	"devops/internal/alert"
	"devops/internal/config"
	"devops/internal/monitor"
	"log"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize alert manager
	alertManager, err := alert.NewManager(cfg.Alert)
	if err != nil {
		log.Fatalf("Failed to initialize alert manager: %v", err)
		return
	}
	defer alertManager.Close()

	// 设置多种通知方式（示例）
	composite := alert.NewCompositeNotifier(
		alert.NewEmailNotifier(cfg.Alert),
		// 可以添加更多通知器
		// alert.NewSlackNotifier("your-webhook-url"),
	)
	alertManager.SetNotifier(composite)

	// Initialize monitors
	monitors := []monitor.Monitor{
		monitor.NewServerMonitor(cfg.ServerMonitoring, alertManager),
		monitor.NewContainerMonitor(cfg.ContainerMonitoring, alertManager),
	}

	// Start monitoring
	monitor.StartMonitoring(monitors, cfg.Monitoring.Interval)
}
