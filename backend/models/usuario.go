package models

import (
	"gorm.io/gorm"
	"time"
)

type Usuario struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Nombre       string         `json:"nombre" gorm:"not null"`
	Email        string         `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
	PasswordHash string         `json:"-" gorm:"not null"`
	Tipo         string         `json:"tipo" gorm:"not null;default:'socio'"` // socio, administrador
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Relaciones
	Inscripciones []Inscripcion `json:"inscripciones,omitempty" gorm:"foreignKey:UsuarioID"`
}
