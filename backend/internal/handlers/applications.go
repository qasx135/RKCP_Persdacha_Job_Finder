package handlers

import (
	"net/http"
	"strconv"

	"job-search-backend/internal/database"
	"job-search-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type ApplicationHandler struct{}

type CreateApplicationRequest struct {
	JobID   uint   `json:"job_id" binding:"required"`
	Message string `json:"message"`
}

func (h *ApplicationHandler) CreateApplication(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req CreateApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if job exists
	var job models.Job
	if err := database.DB.First(&job, req.JobID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	// Check if user already applied
	var existingApplication models.JobApplication
	if err := database.DB.Where("job_id = ? AND user_id = ?", req.JobID, userID).First(&existingApplication).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already applied for this job"})
		return
	}

	application := models.JobApplication{
		JobID:   req.JobID,
		UserID:  userID.(uint),
		Message: req.Message,
		Status:  "pending",
	}

	if err := database.DB.Create(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create application"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"application": application})
}

func (h *ApplicationHandler) GetUserApplications(c *gin.Context) {
	userID, _ := c.Get("userID")

	var applications []models.JobApplication
	if err := database.DB.Where("user_id = ?", userID).Preload("Job").Preload("Job.Employer").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch applications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

func (h *ApplicationHandler) GetEmployerApplications(c *gin.Context) {
	userID, _ := c.Get("userID")

	// Получаем все заявки на вакансии этого работодателя
	var applications []models.JobApplication
	if err := database.DB.Joins("JOIN jobs ON job_applications.job_id = jobs.id").
		Where("jobs.employer_id = ?", userID).
		Preload("Job").
		Preload("User").
		Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch applications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

func (h *ApplicationHandler) GetAllApplications(c *gin.Context) {
	// Получаем все заявки (только для администраторов)
	var applications []models.JobApplication
	if err := database.DB.Preload("Job").Preload("User").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch applications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

func (h *ApplicationHandler) GetJobApplications(c *gin.Context) {
	userID, _ := c.Get("userID")
	jobID, err := strconv.Atoi(c.Param("jobId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	// Check if user is the employer of this job
	var job models.Job
	if err := database.DB.First(&job, jobID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	role, _ := c.Get("role")
	if job.EmployerID != userID.(uint) && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to view applications for this job"})
		return
	}

	var applications []models.JobApplication
	if err := database.DB.Where("job_id = ?", jobID).Preload("User").Preload("User.UserProfile").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch applications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

func (h *ApplicationHandler) UpdateApplicationStatus(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")
	applicationID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid application ID"})
		return
	}

	var application models.JobApplication
	if err := database.DB.Preload("Job").First(&application, applicationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	// Только работодатели и администраторы могут изменять статус заявок
	if role != "employer" && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only employers and admins can update application status"})
		return
	}

	// Проверяем, что пользователь является работодателем этой вакансии или администратором
	if application.Job.EmployerID != userID.(uint) && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to update this application"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=pending accepted rejected"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	application.Status = req.Status
	if err := database.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update application"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"application": application})
}
