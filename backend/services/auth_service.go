package services

import (
	"crypto/md5"
	"crypto/sha256"
	"fmt"
	"time"

	"proyecto-gym-backend/config"
	"proyecto-gym-backend/models"

	"github.com/golang-jwt/jwt/v4"
)

var jwtSecret = []byte("proyecto_gym_secreto_jwt_2024")

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Tipo   string `json:"tipo"`
	jwt.RegisteredClaims
}

func HashPasswordSHA256(password string) string {
	hash := sha256.Sum256([]byte(password))
	return fmt.Sprintf("%x", hash)
}

func HashPasswordMD5(password string) string {
	hash := md5.Sum([]byte(password))
	return fmt.Sprintf("%x", hash)
}

func GenerateJWT(user models.Usuario) (string, error) {
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		Tipo:   user.Tipo,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ValidateJWT(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("token inválido")
	}

	return claims, nil
}

func CreateDefaultAdmin() {
	var count int64
	config.DB.Model(&models.Usuario{}).Where("tipo = ?", "administrador").Count(&count)

	if count == 0 {
		admin := models.Usuario{
			Nombre:       "Administrador",
			Email:        "leoneladmin@gmail.com",
			PasswordHash: HashPasswordSHA256("LeoGamer386"),
			Tipo:         "administrador",
		}
		config.DB.Create(&admin)
		fmt.Println("✅ Usuario administrador creado: admin@proyecto-gym.com / admin123")
	}
}
