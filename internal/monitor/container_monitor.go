package monitor

import (
	"context"
	"fmt"
	"devops/internal/alert"
	"devops/internal/config"

	"github.com/docker/docker/client"
)

type ContainerMonitor struct {
	config       config.ContainerConfig
	alertManager *alert.Manager
	dockerClient *client.Client
}

func NewContainerMonitor(config config.ContainerConfig, alertManager *alert.Manager) *ContainerMonitor {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return &ContainerMonitor{
			config:       config,
			alertManager: alertManager,
		}
	}

	return &ContainerMonitor{
		config:       config,
		alertManager: alertManager,
		dockerClient: cli,
	}
}

func (c *ContainerMonitor) Start() error {
	if c.dockerClient == nil {
		return fmt.Errorf("Docker client not initialized")
	}

	containers, err := c.dockerClient.ContainerList(context.Background(), 
		client.ListContainersOptions{All: true})
	if err != nil {
		return err
	}

	for _, container := range containers {
		for _, monitoredContainer := range c.config.Containers {
			if container.Names[0] == "/"+monitoredContainer.Name {
				// Check container status
				if container.State != "running" {
					c.alertManager.SendAlert(fmt.Sprintf("Container %s is not running. Current state: %s",
						monitoredContainer.Name, container.State))
				}

				// Get container stats
				stats, err := c.dockerClient.ContainerStats(context.Background(), container.ID, false)
				if err != nil {
					continue
				}
				defer stats.Body.Close()

				// Process container stats and send alerts if needed
				// This is a simplified version - you might want to add more detailed monitoring
				if stats.OSType == "" {
					c.alertManager.SendAlert(fmt.Sprintf("Container %s stats unavailable",
						monitoredContainer.Name))
				}
			}
		}
	}

	return nil
}

func (c *ContainerMonitor) Stop() error {
	if c.dockerClient != nil {
		return c.dockerClient.Close()
	}
	return nil
}

func (c *ContainerMonitor) IsEnabled() bool {
	return c.config.Enabled
}
