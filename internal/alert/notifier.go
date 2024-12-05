package alert

import (
	"devops/internal/config"
	"fmt"

	"github.com/go-gomail/gomail"
)

// Notifier 是告警通知的接口
type Notifier interface {
	Notify(alert *Alert) error
}

// EmailNotifier 实现了基于邮件的通知
type EmailNotifier struct {
	config config.AlertConfig
}

// NewEmailNotifier 创建一个新的邮件通知器
func NewEmailNotifier(config config.AlertConfig) *EmailNotifier {
	return &EmailNotifier{
		config: config,
	}
}

// Notify 通过邮件发送告警通知
func (n *EmailNotifier) Notify(alert *Alert) error {
	if !n.config.Email.Enabled {
		return nil
	}

	subject := fmt.Sprintf("[%s] Alert: %s", alert.Severity, alert.Message)
	body := fmt.Sprintf(`Alert Details:
Severity: %s
Status: %s
Message: %s
Time: %s`,
		alert.Severity,
		alert.Status,
		alert.Message,
		alert.CreatedAt.Format("2006-01-02 15:04:05"))

	mailer := gomail.NewMessage()
	mailer.SetHeader("From", n.config.Email.From)
	mailer.SetHeader("To", n.config.Email.To...)
	mailer.SetHeader("Subject", fmt.Sprintf("%s %s", n.config.Email.SubjectPrefix, subject))
	mailer.SetBody("text/plain", body)

	dialer := gomail.NewDialer(
		n.config.Email.SMTPHost,
		n.config.Email.SMTPPort,
		n.config.Email.Username,
		n.config.Email.Password,
	)

	if err := dialer.DialAndSend(mailer); err != nil {
		return fmt.Errorf("failed to send email alert: %v", err)
	}

	return nil
}

// SlackNotifier 实现了基于Slack的通知
type SlackNotifier struct {
	webhookURL string
}

// NewSlackNotifier 创建一个新的Slack通知器
func NewSlackNotifier(webhookURL string) *SlackNotifier {
	return &SlackNotifier{
		webhookURL: webhookURL,
	}
}

// Notify 通过Slack发送告警通知
func (n *SlackNotifier) Notify(alert *Alert) error {
	// TODO: 实现Slack通知逻辑
	return nil
}

// CompositeNotifier 组合多个通知器
type CompositeNotifier struct {
	notifiers []Notifier
}

// NewCompositeNotifier 创建一个新的组合通知器
func NewCompositeNotifier(notifiers ...Notifier) *CompositeNotifier {
	return &CompositeNotifier{
		notifiers: notifiers,
	}
}

// Notify 通过所有注册的通知器发送告警
func (n *CompositeNotifier) Notify(alert *Alert) error {
	var errors []error
	for _, notifier := range n.notifiers {
		if err := notifier.Notify(alert); err != nil {
			errors = append(errors, err)
		}
	}

	if len(errors) > 0 {
		return fmt.Errorf("notification errors: %v", errors)
	}
	return nil
}
