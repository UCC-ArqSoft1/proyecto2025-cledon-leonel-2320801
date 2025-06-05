package main

import (
	"log"
	"net/http"
	"os"

	"proyecto-gym-backend/config"
	"proyecto-gym-backend/controllers"
	"proyecto-gym-backend/middleware"
	"proyecto-gym-backend/models"
	"proyecto-gym-backend/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Inicializar base de datos
	config.InitDB()

	// Auto-migrar modelos
	config.DB.AutoMigrate(&models.Usuario{}, &models.Actividad{}, &models.Inscripcion{})

	// Crear usuario administrador por defecto si no existe
	services.CreateDefaultAdmin()

	// Configurar Gin
	r := gin.Default()

	// Configurar CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000", "http://localhost", "http://localhost:80"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Rutas públicas
	public := r.Group("/api")
	{
		// Autenticación
		public.POST("/login", controllers.Login)
		public.POST("/register", controllers.Register)

		// Actividades (público)
		public.GET("/actividades", controllers.GetActividades)
		public.GET("/actividades/:id", controllers.GetActividadByID)

		// Inscripciones (público)
		public.POST("/inscripciones", controllers.CreateInscripcion)
		public.GET("/usuarios/:id/inscripciones", controllers.GetInscripcionesUsuario)
		public.DELETE("/inscripciones/:id", controllers.DeleteInscripcion)
	}

	// Rutas protegidas (solo administradores)
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware("administrador"))
	{
		admin.GET("/actividades", controllers.GetActividadesAdmin) // ← NUEVA RUTA CON FILTROS
		admin.POST("/actividades", controllers.CreateActividad)
		admin.PUT("/actividades/:id", controllers.UpdateActividad)
		admin.DELETE("/actividades/:id", controllers.DeleteActividad)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🏋️‍♂️ Gimnasio Backend iniciado en puerto %s", port)
	log.Printf("🌐 API disponible en: http://localhost:%s/api", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
