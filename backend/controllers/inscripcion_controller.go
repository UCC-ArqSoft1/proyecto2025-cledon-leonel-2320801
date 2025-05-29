package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"proyecto-gym-backend/config"
	"proyecto-gym-backend/models"

	"github.com/gin-gonic/gin"
)

type InscripcionRequest struct {
	UsuarioID   uint `json:"usuario_id" binding:"required"`
	ActividadID uint `json:"actividad_id" binding:"required"`
}

func CreateInscripcion(c *gin.Context) {
	var req InscripcionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Datos inválidos: %v", err.Error())})
		return
	}

	// Log para debug
	fmt.Printf("🔍 Intentando crear inscripción - Usuario ID: %d, Actividad ID: %d\n", req.UsuarioID, req.ActividadID)

	// Verificar que el usuario existe
	var usuario models.Usuario
	if err := config.DB.First(&usuario, req.UsuarioID).Error; err != nil {
		fmt.Printf("❌ Usuario no encontrado: ID %d\n", req.UsuarioID)
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Usuario con ID %d no encontrado", req.UsuarioID)})
		return
	}
	fmt.Printf("✅ Usuario encontrado: %s (%s)\n", usuario.Nombre, usuario.Email)

	// Verificar que la actividad existe
	var actividad models.Actividad
	if err := config.DB.First(&actividad, req.ActividadID).Error; err != nil {
		fmt.Printf("❌ Actividad no encontrada: ID %d\n", req.ActividadID)
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Actividad con ID %d no encontrada", req.ActividadID)})
		return
	}
	fmt.Printf("✅ Actividad encontrada: %s\n", actividad.Titulo)

	// Verificar que no esté ya inscrito
	var existeInscripcion models.Inscripcion
	if err := config.DB.Where("usuario_id = ? AND actividad_id = ?", req.UsuarioID, req.ActividadID).First(&existeInscripcion).Error; err == nil {
		fmt.Printf("⚠️ Usuario ya inscrito en esta actividad\n")
		c.JSON(http.StatusConflict, gin.H{"error": "Ya estás inscrito en esta actividad"})
		return
	}

	// Verificar cupo disponible
	var inscripcionesCount int64
	config.DB.Model(&models.Inscripcion{}).Where("actividad_id = ?", req.ActividadID).Count(&inscripcionesCount)
	fmt.Printf("📊 Inscripciones actuales: %d / %d\n", inscripcionesCount, actividad.CupoMaximo)

	if int(inscripcionesCount) >= actividad.CupoMaximo {
		c.JSON(http.StatusConflict, gin.H{"error": "No hay cupo disponible para esta actividad"})
		return
	}

	// Crear inscripción con fecha actual usando puntero
	now := time.Now()
	inscripcion := models.Inscripcion{
		UsuarioID:        req.UsuarioID,
		ActividadID:      req.ActividadID,
		FechaInscripcion: &now,
	}

	if err := config.DB.Create(&inscripcion).Error; err != nil {
		fmt.Printf("❌ Error creando inscripción en BD: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error creando inscripción: %v", err.Error())})
		return
	}

	fmt.Printf("✅ Inscripción creada exitosamente - ID: %d\n", inscripcion.ID)

	// Cargar relaciones
	config.DB.Preload("Usuario").Preload("Actividad").First(&inscripcion, inscripcion.ID)

	c.JSON(http.StatusCreated, inscripcion)
}

func GetInscripcionesUsuario(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	fmt.Printf("🔍 Obteniendo inscripciones para usuario ID: %d\n", userID)

	var inscripciones []models.Inscripcion
	if err := config.DB.Preload("Actividad").Where("usuario_id = ?", uint(userID)).Find(&inscripciones).Error; err != nil {
		fmt.Printf("❌ Error obteniendo inscripciones: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo inscripciones"})
		return
	}

	fmt.Printf("✅ Encontradas %d inscripciones\n", len(inscripciones))
	c.JSON(http.StatusOK, inscripciones)
}

// NUEVA FUNCIÓN: Eliminar inscripción (darse de baja)
func DeleteInscripcion(c *gin.Context) {
	inscripcionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de inscripción inválido"})
		return
	}

	fmt.Printf("🔍 Intentando eliminar inscripción ID: %d\n", inscripcionID)

	// Verificar que la inscripción existe
	var inscripcion models.Inscripcion
	if err := config.DB.Preload("Actividad").First(&inscripcion, uint(inscripcionID)).Error; err != nil {
		fmt.Printf("❌ Inscripción no encontrada: ID %d\n", inscripcionID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Inscripción no encontrada"})
		return
	}

	actividadTitulo := "Actividad desconocida"
	if inscripcion.Actividad.Titulo != "" {
		actividadTitulo = inscripcion.Actividad.Titulo
	}

	// Eliminar la inscripción
	if err := config.DB.Delete(&inscripcion).Error; err != nil {
		fmt.Printf("❌ Error eliminando inscripción: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando inscripción"})
		return
	}

	fmt.Printf("✅ Inscripción eliminada exitosamente - Actividad: %s\n", actividadTitulo)

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Te has dado de baja de '%s' exitosamente", actividadTitulo),
	})
}
