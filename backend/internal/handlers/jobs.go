package handlers

import (
	"net/http"
	"strconv"

	"job-search-backend/internal/database"
	"job-search-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type JobHandler struct{}

type CreateJobRequest struct {
	Title        string `json:"title" binding:"required"`
	Description  string `json:"description" binding:"required"`
	Company      string `json:"company" binding:"required"`
	Location     string `json:"location"`
	Salary       string `json:"salary"`
	Type         string `json:"type"`
	Category     string `json:"category"`
	Requirements string `json:"requirements"`
	Benefits     string `json:"benefits"`
}

func (h *JobHandler) CreateJob(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req CreateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job := models.Job{
		Title:        req.Title,
		Description:  req.Description,
		Company:      req.Company,
		Location:     req.Location,
		Salary:       req.Salary,
		Type:         req.Type,
		Category:     req.Category,
		Requirements: req.Requirements,
		Benefits:     req.Benefits,
		EmployerID:   userID.(uint),
		IsActive:     true,
	}

	if err := database.DB.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"job": job})
}

func (h *JobHandler) GetJobs(c *gin.Context) {
	var jobs []models.Job
	query := database.DB.Where("is_active = ?", true).Preload("Employer")

	// Filter by category
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	// Filter by location
	if location := c.Query("location"); location != "" {
		query = query.Where("location ILIKE ?", "%"+location+"%")
	}

	// Filter by type
	if jobType := c.Query("type"); jobType != "" {
		query = query.Where("type = ?", jobType)
	}

	// Search by title or description
	if search := c.Query("search"); search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var total int64
	query.Model(&models.Job{}).Count(&total)

	if err := query.Offset(offset).Limit(limit).Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch jobs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"jobs":  jobs,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *JobHandler) GetAllJobs(c *gin.Context) {
	// Получаем все вакансии (только для администраторов)
	var jobs []models.Job
	if err := database.DB.Preload("Employer").Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch jobs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

func (h *JobHandler) GetJob(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	var job models.Job
	if err := database.DB.Preload("Employer").First(&job, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"job": job})
}

func (h *JobHandler) UpdateJob(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	var job models.Job
	if err := database.DB.First(&job, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	// Check if user is the employer or admin
	role, _ := c.Get("role")
	if job.EmployerID != userID.(uint) && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to update this job"})
		return
	}

	var req CreateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job.Title = req.Title
	job.Description = req.Description
	job.Company = req.Company
	job.Location = req.Location
	job.Salary = req.Salary
	job.Type = req.Type
	job.Category = req.Category
	job.Requirements = req.Requirements
	job.Benefits = req.Benefits

	if err := database.DB.Save(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update job"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"job": job})
}

func (h *JobHandler) DeleteJob(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	var job models.Job
	if err := database.DB.First(&job, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	// Check if user is the employer or admin
	role, _ := c.Get("role")
	if job.EmployerID != userID.(uint) && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this job"})
		return
	}

	if err := database.DB.Delete(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete job"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job deleted successfully"})
}
