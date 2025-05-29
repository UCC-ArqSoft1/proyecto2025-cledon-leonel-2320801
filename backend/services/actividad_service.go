package services

import (
	"proyecto-gym-backend/config"
	"proyecto-gym-backend/models"
)

func GetActividadesConCupo() ([]models.Actividad, error) {
	var actividades []models.Actividad

	if err := config.DB.Find(&actividades).Error; err != nil {
		return nil, err
	}

	for i := range actividades {
		var inscripcionesCount int64
		config.DB.Model(&models.Inscripcion{}).Where("actividad_id = ?", actividades[i].ID).Count(&inscripcionesCount)
		actividades[i].CupoDisponible = actividades[i].CupoMaximo - int(inscripcionesCount)
	}

	return actividades, nil
}

func GetActividadByIDConCupo(id uint) (*models.Actividad, error) {
	var actividad models.Actividad

	if err := config.DB.First(&actividad, id).Error; err != nil {
		return nil, err
	}

	var inscripcionesCount int64
	config.DB.Model(&models.Inscripcion{}).Where("actividad_id = ?", actividad.ID).Count(&inscripcionesCount)
	actividad.CupoDisponible = actividad.CupoMaximo - int(inscripcionesCount)

	return &actividad, nil
}
