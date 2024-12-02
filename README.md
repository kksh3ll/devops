# DevOps Monitoring System

A modular and extensible monitoring system written in Go that monitors server resources and container status.

## Features

- Server resource monitoring:
  - CPU usage
  - Memory usage
  - Disk usage
- Container monitoring:
  - Container status
  - Container health
- Alert system:
  - Email notifications
- Modular design for easy extension

## Project Structure

```
.
├── config/
│   └── config.yaml         # Configuration file
├── internal/
│   ├── alert/             # Alert system implementation
│   ├── config/            # Configuration management
│   └── monitor/           # Monitoring implementations
├── go.mod                 # Go module file
├── main.go                # Application entry point
└── README.md             # This file
```

## Configuration

Edit `config/config.yaml` to configure:
- Monitoring intervals
- Resource thresholds
- Container details
- Email alert settings

## Setup

1. Install dependencies:
```bash
go mod download
```

2. Configure the system in `config/config.yaml`

3. Build the application:
```bash
go build
```

4. Run the monitoring system:
```bash
./devops
```

## Extending the System

To add new monitoring capabilities:

1. Create a new monitor implementation in `internal/monitor/`
2. Implement the `Monitor` interface
3. Add configuration in `config/config.yaml`
4. Register the new monitor in `main.go`

## Requirements

- Go 1.21 or higher
- Docker (for container monitoring)
- SMTP server access (for email alerts)
