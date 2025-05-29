package models

import (
	"gorm.io/gorm"
	"time"
)

type Inscripcion struct {
	ID               uint           `json:"id" gorm:"primaryKey"`
	UsuarioID        uint           `json:"usuario_id" gorm:"not null"`
	ActividadID      uint           `json:"actividad_id" gorm:"not null"`
	FechaInscripcion *time.Time     `json:"fecha_inscripcion" gorm:"type:datetime"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`

	// Relaciones
	Usuario   Usuario   `json:"usuario,omitempty" gorm:"foreignKey:UsuarioID"`
	Actividad Actividad `json:"actividad,omitempty" gorm:"foreignKey:ActividadID"`
}
