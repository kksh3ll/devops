package notifier

import (
	"fmt"
)

type Notifier interface {
	Notify(message string, severity string) error
}

type Manager struct {
	notifiers []Notifier
}

func NewManager() *Manager {
	return &Manager{
		notifiers: make([]Notifier, 0),
	}
}

func (m *Manager) AddNotifier(n Notifier) {
	m.notifiers = append(m.notifiers, n)
}

func (m *Manager) NotifyAll(message string, severity string) error {
	var errs []error
	for _, n := range m.notifiers {
		if err := n.Notify(message, severity); err != nil {
			errs = append(errs, err)
		}
	}
	if len(errs) > 0 {
		return fmt.Errorf("notification errors: %v", errs)
	}
	return nil
} 