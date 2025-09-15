package models

import (
	"time"

	"gorm.io/gorm"
)

type Job struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null"`
	Description string         `json:"description" gorm:"type:text"`
	Company     string         `json:"company" gorm:"not null"`
	Location    string         `json:"location"`
	Salary      string         `json:"salary"`
	Type        string         `json:"type"` // full-time, part-time, contract
	Category    string         `json:"category"`
	Requirements string        `json:"requirements" gorm:"type:text"`
	Benefits    string         `json:"benefits" gorm:"type:text"`
	EmployerID  uint           `json:"employer_id" gorm:"not null"`
	Employer    User           `json:"employer" gorm:"foreignKey:EmployerID"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type JobApplication struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	JobID     uint           `json:"job_id" gorm:"not null"`
	Job       Job            `json:"job" gorm:"foreignKey:JobID"`
	UserID    uint           `json:"user_id" gorm:"not null"`
	User      User           `json:"user" gorm:"foreignKey:UserID"`
	Status    string         `json:"status" gorm:"default:'pending'"` // pending, accepted, rejected
	Message   string         `json:"message" gorm:"type:text"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}


