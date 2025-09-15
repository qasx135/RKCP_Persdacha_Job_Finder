package main

import (
	"log"
	"net/http"
	"os"

	"job-search-backend/internal/database"
	"job-search-backend/internal/handlers"
	"job-search-backend/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to database
	database.Connect()
	database.Migrate()

	// Initialize Gin router
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "TRACE"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// Add TRACE method support
	r.Handle("TRACE", "/*path", func(c *gin.Context) {
		c.Header("Allow", "GET, POST, PUT, DELETE, OPTIONS")
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Method Not Allowed"})
	})

	// Initialize handlers
	authHandler := &handlers.AuthHandler{}
	jobHandler := &handlers.JobHandler{}
	applicationHandler := &handlers.ApplicationHandler{}

	// Public routes
	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Public job routes
		jobs := api.Group("/jobs")
		{
			jobs.GET("", jobHandler.GetJobs)
			jobs.GET("/:id", jobHandler.GetJob)
		}
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// User profile
		protected.GET("/profile", authHandler.GetProfile)

		// Job management (employers)
		protected.POST("/jobs", middleware.EmployerMiddleware(), jobHandler.CreateJob)
		protected.PUT("/jobs/:id", jobHandler.UpdateJob)
		protected.DELETE("/jobs/:id", jobHandler.DeleteJob)

		// Applications
		protected.POST("/applications", applicationHandler.CreateApplication)
		protected.GET("/applications/my", applicationHandler.GetUserApplications)
		protected.GET("/applications/employer", middleware.EmployerMiddleware(), applicationHandler.GetEmployerApplications)
		protected.GET("/applications/job/:jobId", applicationHandler.GetJobApplications)
		protected.PUT("/applications/:id/status", middleware.EmployerMiddleware(), applicationHandler.UpdateApplicationStatus)

		// Admin routes
		protected.GET("/applications/all", middleware.AdminMiddleware(), applicationHandler.GetAllApplications)
		protected.GET("/jobs/all", middleware.AdminMiddleware(), jobHandler.GetAllJobs)
	}

	// Start server
	port := "8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
