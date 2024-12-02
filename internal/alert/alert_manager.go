package alert

import (
	"fmt"
	"devops/internal/config"

	"github.com/go-gomail/gomail"
)

type Manager struct {
	config config.AlertConfig
}

func NewManager(config config.AlertConfig) *Manager {
	return &Manager{
		config: config,
	}
}

func (m *Manager) SendAlert(message string) error {
	if m.config.Email.Enabled {
		return m.sendEmailAlert(message)
	}
	return nil
}

func (m *Manager) sendEmailAlert(message string) error {
	mailer := gomail.NewMessage()
	mailer.SetHeader("From", m.config.Email.From)
	mailer.SetHeader("To", m.config.Email.To...)
	mailer.SetHeader("Subject", fmt.Sprintf("%s %s", m.config.Email.SubjectPrefix, message))
	mailer.SetBody("text/plain", message)

	dialer := gomail.NewDialer(
		m.config.Email.SMTPHost,
		m.config.Email.SMTPPort,
		m.config.Email.Username,
		m.config.Email.Password,
	)

	if err := dialer.DialAndSend(mailer); err != nil {
		return fmt.Errorf("failed to send email alert: %v", err)
	}

	return nil
}
