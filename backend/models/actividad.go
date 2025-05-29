package models

import (
	"gorm.io/gorm"
	"time"
)

type Actividad struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	Titulo          string         `json:"titulo" gorm:"not null"`
	Categoria       string         `json:"categoria" gorm:"not null"`
	Descripcion     string         `json:"descripcion"`
	Dia             string         `json:"dia" gorm:"not null"`
	Horario         string         `json:"horario" gorm:"not null"`
	DuracionMinutos int            `json:"duracion_minutos" gorm:"not null"`
	CupoMaximo      int            `json:"cupo_maximo" gorm:"not null"`
	Profesor        string         `json:"profesor" gorm:"not null"`
	FotoURL         string         `json:"foto_url"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`

	// Relaciones
	Inscripciones  []Inscripcion `json:"inscripciones,omitempty" gorm:"foreignKey:ActividadID"`
	CupoDisponible int           `json:"cupo_disponible" gorm:"-"`
}
