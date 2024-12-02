package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Monitoring          MonitoringConfig     `mapstructure:"monitoring"`
	ServerMonitoring    ServerMonitorConfig  `mapstructure:"server_monitoring"`
	ContainerMonitoring ContainerConfig      `mapstructure:"container_monitoring"`
	Alert              AlertConfig          `mapstructure:"alert"`
}

type MonitoringConfig struct {
	Interval int `mapstructure:"interval"`
}

type ServerMonitorConfig struct {
	Enabled         bool    `mapstructure:"enabled"`
	CPUThreshold    float64 `mapstructure:"cpu_threshold"`
	MemoryThreshold float64 `mapstructure:"memory_threshold"`
	DiskThreshold   float64 `mapstructure:"disk_threshold"`
}

type ContainerConfig struct {
	Enabled    bool              `mapstructure:"enabled"`
	Containers []ContainerDetail `mapstructure:"containers"`
}

type ContainerDetail struct {
	Name string `mapstructure:"name"`
	Port int    `mapstructure:"port"`
}

type AlertConfig struct {
	Email EmailConfig `mapstructure:"email"`
}

type EmailConfig struct {
	Enabled      bool     `mapstructure:"enabled"`
	SMTPHost     string   `mapstructure:"smtp_host"`
	SMTPPort     int      `mapstructure:"smtp_port"`
	Username     string   `mapstructure:"username"`
	Password     string   `mapstructure:"password"`
	From         string   `mapstructure:"from"`
	To           []string `mapstructure:"to"`
	SubjectPrefix string   `mapstructure:"subject_prefix"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
