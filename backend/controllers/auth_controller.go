package controllers

import (
	"net/http"

	"proyecto-gym-backend/config"
	"proyecto-gym-backend/models"
	"proyecto-gym-backend/services"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Nombre   string `json:"nombre" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Tipo     string `json:"tipo"` // Opcional, por defecto será "socio"
}

type LoginResponse struct {
	Token string         `json:"token"`
	User  models.Usuario `json:"user"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.Usuario
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	// Verificar contraseña (primero SHA256, luego MD5 como fallback)
	passwordHashSHA := services.HashPasswordSHA256(req.Password)
	passwordHashMD5 := services.HashPasswordMD5(req.Password)

	if user.PasswordHash != passwordHashSHA && user.PasswordHash != passwordHashMD5 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	token, err := services.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando token"})
		return
	}

	response := LoginResponse{
		Token: token,
		User:  user,
	}

	c.JSON(http.StatusOK, response)
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar que el email no esté en uso
	var existingUser models.Usuario
	if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "El email ya está registrado"})
		return
	}

	// Establecer tipo por defecto si no se especifica
	if req.Tipo == "" {
		req.Tipo = "socio"
	}

	// Validar tipo de usuario
	if req.Tipo != "socio" && req.Tipo != "administrador" {
		req.Tipo = "socio" // Por seguridad, defaultear a socio
	}

	// Crear nuevo usuario
	user := models.Usuario{
		Nombre:       req.Nombre,
		Email:        req.Email,
		PasswordHash: services.HashPasswordSHA256(req.Password),
		Tipo:         req.Tipo,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando usuario"})
		return
	}

	// Generar token JWT para login automático
	token, err := services.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Usuario creado pero error generando token"})
		return
	}

	response := LoginResponse{
		Token: token,
		User:  user,
	}

	c.JSON(http.StatusCreated, response)
}
