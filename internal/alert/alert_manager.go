package alert

import (
	"database/sql"
	"devops/internal/config"
	"fmt"
	"time"

	_ "modernc.org/sqlite"
)

// Alert severity levels
const (
	SeverityLow    = "low"
	SeverityMedium = "medium"
	SeverityHigh   = "high"
)

// Alert status
const (
	StatusNew     = "new"
	StatusRead    = "read"
	StatusIgnored = "ignored"
)

// Alert represents an alert event
type Alert struct {
	ID        int64
	Message   string
	Severity  string
	Status    string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Manager struct {
	config   config.AlertConfig
	db       *sql.DB
	notifier Notifier
}

func NewManager(config config.AlertConfig) (*Manager, error) {
	// 使用 file: 前缀来明确指定这是一个文件路径
	db, err := sql.Open("sqlite", "file:alerts.db?cache=shared&_journal_mode=WAL")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// 设置连接池参数
	db.SetMaxOpenConns(1) // SQLite 建议只使用一个连接
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(time.Hour)

	if err := initDB(db); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to initialize database: %v", err)
	}

	// 创建默认的通知器（邮件通知）
	notifier := NewEmailNotifier(config)

	return &Manager{
		config:   config,
		db:       db,
		notifier: notifier,
	}, nil
}

// SetNotifier 允许设置自定义的通知器
func (m *Manager) SetNotifier(notifier Notifier) {
	m.notifier = notifier
}

// CreateAlert creates a new alert in the database
func (m *Manager) CreateAlert(message, severity string) error {
	if severity != SeverityLow && severity != SeverityMedium && severity != SeverityHigh {
		return fmt.Errorf("invalid severity level: %s", severity)
	}

	now := time.Now()
	var alert Alert
	err := m.db.QueryRow(
		`INSERT INTO alerts (message, severity, status, created_at, updated_at) 
		VALUES (?, ?, ?, ?, ?) 
		RETURNING id, message, severity, status, created_at, updated_at`,
		message, severity, StatusNew, now, now,
	).Scan(&alert.ID, &alert.Message, &alert.Severity, &alert.Status, &alert.CreatedAt, &alert.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create alert: %v", err)
	}

	// 根据严重程度发送通知
	if severity == SeverityHigh || severity == SeverityMedium {
		if err := m.notifier.Notify(&alert); err != nil {
			// 记录通知错误但不影响告警创建
			fmt.Printf("Failed to send notification: %v\n", err)
		}
	}

	return nil
}

// QueryAlerts queries alerts based on filters
func (m *Manager) QueryAlerts(severity, status string, startTime, endTime time.Time) ([]Alert, error) {
	query := "SELECT id, message, severity, status, created_at, updated_at FROM alerts WHERE 1=1"
	var args []interface{}

	if severity != "" {
		query += " AND severity = ?"
		args = append(args, severity)
	}
	if status != "" {
		query += " AND status = ?"
		args = append(args, status)
	}
	if !startTime.IsZero() {
		query += " AND created_at >= ?"
		args = append(args, startTime)
	}
	if !endTime.IsZero() {
		query += " AND created_at <= ?"
		args = append(args, endTime)
	}

	query += " ORDER BY created_at DESC"

	rows, err := m.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query alerts: %v", err)
	}
	defer rows.Close()

	var alerts []Alert
	for rows.Next() {
		var alert Alert
		err := rows.Scan(
			&alert.ID,
			&alert.Message,
			&alert.Severity,
			&alert.Status,
			&alert.CreatedAt,
			&alert.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan alert row: %v", err)
		}
		alerts = append(alerts, alert)
	}
	return alerts, nil
}

// UpdateAlertStatus updates the status of an alert
func (m *Manager) UpdateAlertStatus(alertID int64, status string) error {
	if status != StatusRead && status != StatusIgnored {
		return fmt.Errorf("invalid status: %s", status)
	}

	result, err := m.db.Exec(
		"UPDATE alerts SET status = ?, updated_at = ? WHERE id = ?",
		status, time.Now(), alertID,
	)
	if err != nil {
		return fmt.Errorf("failed to update alert status: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("alert with ID %d not found", alertID)
	}
	return nil
}

func initDB(db *sql.DB) error {
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS alerts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		message TEXT NOT NULL,
		severity TEXT NOT NULL,
		status TEXT NOT NULL,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);
	CREATE INDEX IF NOT EXISTS idx_severity ON alerts(severity);
	CREATE INDEX IF NOT EXISTS idx_status ON alerts(status);
	CREATE INDEX IF NOT EXISTS idx_created_at ON alerts(created_at);
	`
	_, err := db.Exec(createTableSQL)
	return err
}

func (m *Manager) Close() error {
	return m.db.Close()
}
