package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
	tiktoken_go "github.com/j178/tiktoken-go"
)

type Message struct {
	ID        string
	Role      string
	Content   string
	Tokens    int
	Model     *Model
	CreatedAt time.Time
}

const RoleUser = "user"
const RoleSystem = "system"
const RoleAssistant = "assistant"

func NewMessage(role, content string, model *Model) (*Message, error) {
	totalTokens := tiktoken_go.CountTokens(model.GetModelName(), content)

	msg := &Message{
		ID:        uuid.New().String(),
		Role:      role,
		Content:   content,
		Tokens:    totalTokens,
		Model:     model,
		CreatedAt: time.Now(),
	}

	err := msg.Validate()
	if err != nil {
		return nil, err
	}

	return msg, nil
}

func (m *Message) Validate() error {
	if m.Role != RoleUser && m.Role != RoleSystem && m.Role != RoleAssistant {
		return errors.New("invalid role")
	}

	if m.Content == "" {
		return errors.New("content is empty")
	}

	return nil
}

func (m *Message) GetQtdTokens() int {
	return m.Tokens
}
