package controllers

import (
	"net/http"
	"strconv"

	"proyecto-gym-backend/config"
	"proyecto-gym-backend/models"
	"proyecto-gym-backend/services"

	"github.com/gin-gonic/gin"
)

func GetActividades(c *gin.Context) {
	// Parámetros de búsqueda
	search := c.Query("search")
	categoria := c.Query("categoria")
	horario := c.Query("horario")

	query := config.DB.Model(&models.Actividad{})

	if search != "" {
		query = query.Where("titulo LIKE ? OR descripcion LIKE ? OR profesor LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if categoria != "" {
		query = query.Where("categoria = ?", categoria)
	}

	if horario != "" {
		query = query.Where("horario = ?", horario)
	}

	var actividades []models.Actividad
	if err := query.Find(&actividades).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo actividades"})
		return
	}

	// Calcular cupo disponible
	for i := range actividades {
		var inscripcionesCount int64
		config.DB.Model(&models.Inscripcion{}).Where("actividad_id = ?", actividades[i].ID).Count(&inscripcionesCount)
		actividades[i].CupoDisponible = actividades[i].CupoMaximo - int(inscripcionesCount)
	}

	c.JSON(http.StatusOK, actividades)
}

// NUEVA FUNCIÓN PARA ADMIN CON FILTROS
func GetActividadesAdmin(c *gin.Context) {
	// Parámetros de búsqueda para admin
	search := c.Query("search")
	categoria := c.Query("categoria")
	dia := c.Query("dia")

	query := config.DB.Model(&models.Actividad{})

	if search != "" {
		query = query.Where("titulo LIKE ? OR descripcion LIKE ? OR profesor LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if categoria != "" {
		query = query.Where("categoria = ?", categoria)
	}

	if dia != "" {
		query = query.Where("dia = ?", dia)
	}

	// Ordenar por día de la semana y luego por hora
	query = query.Order(`
		CASE dia 
			WHEN 'Lunes' THEN 1
			WHEN 'Martes' THEN 2
			WHEN 'Miércoles' THEN 3
			WHEN 'Jueves' THEN 4
			WHEN 'Viernes' THEN 5
			WHEN 'Sábado' THEN 6
			WHEN 'Domingo' THEN 7
			WHEN 'Horario Libre' THEN 8
		END,
		CASE 
			WHEN horario = 'Horario Libre' THEN '00:00'
			ELSE horario
		END
	`)

	var actividades []models.Actividad
	if err := query.Find(&actividades).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo actividades"})
		return
	}

	// Calcular cupo disponible
	for i := range actividades {
		var inscripcionesCount int64
		config.DB.Model(&models.Inscripcion{}).Where("actividad_id = ?", actividades[i].ID).Count(&inscripcionesCount)
		actividades[i].CupoDisponible = actividades[i].CupoMaximo - int(inscripcionesCount)
	}

	c.JSON(http.StatusOK, actividades)
}

func GetActividadByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	actividad, err := services.GetActividadByIDConCupo(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Actividad no encontrada"})
		return
	}

	c.JSON(http.StatusOK, actividad)
}

func CreateActividad(c *gin.Context) {
	var actividad models.Actividad
	if err := c.ShouldBindJSON(&actividad); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&actividad).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando actividad"})
		return
	}

	c.JSON(http.StatusCreated, actividad)
}

func UpdateActividad(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var actividad models.Actividad
	if err := config.DB.First(&actividad, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Actividad no encontrada"})
		return
	}

	if err := c.ShouldBindJSON(&actividad); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&actividad).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando actividad"})
		return
	}

	c.JSON(http.StatusOK, actividad)
}

func DeleteActividad(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := config.DB.Delete(&models.Actividad{}, uint(id)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando actividad"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Actividad eliminada correctamente"})
}
