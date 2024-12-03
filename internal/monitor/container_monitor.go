package monitor

import (
	"context"
	"fmt"
	"devops/internal/alert"
	"devops/internal/config"

	"github.com/docker/docker/api/types"
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
	if !c.IsEnabled() {
		return nil
	}

	if c.dockerClient == nil {
		return fmt.Errorf("Docker client not initialized")
	}

	containers, err := c.dockerClient.ContainerList(context.Background(), types.ContainerListOptions{All: true})
	if err != nil {
		return fmt.Errorf("failed to list containers: %v", err)
	}

	for _, container := range containers {
		for _, monitoredContainer := range c.config.Containers {
			// Docker在容器名前加"/"，所以我们需要处理这种情况
			containerName := container.Names[0]
			if len(containerName) > 0 && containerName[0] == '/' {
				containerName = containerName[1:]
			}

			if containerName == monitoredContainer.Name {
				// 检查容器状态
				if container.State != "running" {
					err := c.alertManager.CreateAlert(
						fmt.Sprintf("Container %s is not running. Current state: %s",
							monitoredContainer.Name, container.State),
						alert.SeverityHigh,
					)
					if err != nil {
						fmt.Printf("Failed to create alert for container %s: %v\n",
							monitoredContainer.Name, err)
					}
				}

				// 获取容器统计信息
				stats, err := c.dockerClient.ContainerStats(context.Background(), container.ID, false)
				if err != nil {
					fmt.Printf("Failed to get stats for container %s: %v\n",
						monitoredContainer.Name, err)
					continue
				}
				defer stats.Body.Close()

				// 处理容器统计信息
				if stats.OSType == "" {
					err := c.alertManager.CreateAlert(
						fmt.Sprintf("Container %s stats unavailable",
							monitoredContainer.Name),
						alert.SeverityMedium,
					)
					if err != nil {
						fmt.Printf("Failed to create alert for container %s stats: %v\n",
							monitoredContainer.Name, err)
					}
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
