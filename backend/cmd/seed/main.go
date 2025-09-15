package main

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Simple models for seeding
type User struct {
	ID        uint   `gorm:"primaryKey"`
	Email     string `gorm:"unique;not null"`
	Password  string `gorm:"not null"`
	Name      string `gorm:"not null"`
	Role      string `gorm:"default:'job_seeker'"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type UserProfile struct {
	ID         uint `gorm:"primaryKey"`
	UserID     uint `gorm:"not null"`
	Phone      string
	Location   string
	Experience string
	Skills     string
	Education  string
	Resume     string
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  gorm.DeletedAt `gorm:"index"`
}

type Job struct {
	ID           uint   `gorm:"primaryKey"`
	Title        string `gorm:"not null"`
	Description  string `gorm:"type:text"`
	Company      string `gorm:"not null"`
	Location     string
	Salary       string
	Type         string
	Category     string
	Requirements string `gorm:"type:text"`
	Benefits     string `gorm:"type:text"`
	EmployerID   uint   `gorm:"not null"`
	IsActive     bool   `gorm:"default:true"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}

type JobApplication struct {
	ID        uint   `gorm:"primaryKey"`
	JobID     uint   `gorm:"not null"`
	UserID    uint   `gorm:"not null"`
	Status    string `gorm:"default:'pending'"`
	Message   string `gorm:"type:text"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func main() {
	// Connect to database
	dsn := "host=postgres user=postgres password=password dbname=jobsearch port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")

	// Auto migrate
	db.AutoMigrate(&User{}, &UserProfile{}, &Job{}, &JobApplication{})

	// Clear existing data
	log.Println("Clearing existing data...")
	db.Exec("DELETE FROM job_applications")
	db.Exec("DELETE FROM jobs")
	db.Exec("DELETE FROM user_profiles")
	db.Exec("DELETE FROM users")

	// Reset auto-increment sequences
	db.Exec("ALTER SEQUENCE users_id_seq RESTART WITH 1")
	db.Exec("ALTER SEQUENCE user_profiles_id_seq RESTART WITH 1")
	db.Exec("ALTER SEQUENCE jobs_id_seq RESTART WITH 1")
	db.Exec("ALTER SEQUENCE job_applications_id_seq RESTART WITH 1")

	// Hash password for all users
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	// Create test users
	log.Println("Creating test users...")
	users := []User{
		{
			Email:    "admin@example.com",
			Password: string(hashedPassword),
			Name:     "Администратор",
			Role:     "admin",
		},
		{
			Email:    "employer1@company.com",
			Password: string(hashedPassword),
			Name:     "Иван Петров",
			Role:     "employer",
		},
		{
			Email:    "employer2@tech.com",
			Password: string(hashedPassword),
			Name:     "Мария Сидорова",
			Role:     "employer",
		},
		{
			Email:    "jobseeker1@email.com",
			Password: string(hashedPassword),
			Name:     "Алексей Козлов",
			Role:     "job_seeker",
		},
		{
			Email:    "jobseeker2@email.com",
			Password: string(hashedPassword),
			Name:     "Елена Волкова",
			Role:     "job_seeker",
		},
		{
			Email:    "jobseeker3@email.com",
			Password: string(hashedPassword),
			Name:     "Дмитрий Морозов",
			Role:     "job_seeker",
		},
	}

	for _, user := range users {
		if err := db.Create(&user).Error; err != nil {
			log.Fatal("Failed to create user:", err)
		}
	}

	// Create user profiles
	log.Println("Creating user profiles...")
	profiles := []UserProfile{
		{
			UserID:     1,
			Phone:      "+7 (999) 123-45-67",
			Location:   "Москва",
			Experience: "10+ лет в IT",
			Skills:     "Go, Python, Docker, Kubernetes",
			Education:  "МГУ, Факультет ВМК",
			Resume:     "Опытный разработчик с большим опытом в backend разработке",
		},
		{
			UserID:     2,
			Phone:      "+7 (999) 234-56-78",
			Location:   "Санкт-Петербург",
			Experience: "8 лет в HR",
			Skills:     "Управление персоналом, рекрутинг",
			Education:  "СПбГУ, Психология",
			Resume:     "HR-директор с опытом работы в крупных IT компаниях",
		},
		{
			UserID:     3,
			Phone:      "+7 (999) 345-67-89",
			Location:   "Москва",
			Experience: "12 лет в IT",
			Skills:     "JavaScript, React, Node.js, AWS",
			Education:  "МФТИ, Факультет управления и прикладной математики",
			Resume:     "CTO и сооснователь IT стартапа",
		},
		{
			UserID:     4,
			Phone:      "+7 (999) 456-78-90",
			Location:   "Москва",
			Experience: "3 года в разработке",
			Skills:     "Go, PostgreSQL, Docker",
			Education:  "МГТУ им. Баумана, Информатика",
			Resume:     "Молодой разработчик, ищущий интересные проекты",
		},
		{
			UserID:     5,
			Phone:      "+7 (999) 567-89-01",
			Location:   "Санкт-Петербург",
			Experience: "2 года в дизайне",
			Skills:     "Figma, Adobe Creative Suite, HTML/CSS",
			Education:  "СПбГУ, Дизайн",
			Resume:     "UI/UX дизайнер с опытом работы в веб-студиях",
		},
		{
			UserID:     6,
			Phone:      "+7 (999) 678-90-12",
			Location:   "Екатеринбург",
			Experience: "1 год в маркетинге",
			Skills:     "SMM, Google Analytics, контент-маркетинг",
			Education:  "УрФУ, Маркетинг",
			Resume:     "Маркетолог, специализирующийся на digital-маркетинге",
		},
	}

	for _, profile := range profiles {
		if err := db.Create(&profile).Error; err != nil {
			log.Fatal("Failed to create user profile:", err)
		}
	}

	// Create test jobs
	log.Println("Creating test jobs...")
	jobs := []Job{
		{
			Title:        "Senior Go Developer",
			Description:  "Ищем опытного Go разработчика для работы над высоконагруженными системами. Проект связан с финтехом, работа в команде из 5-7 человек.",
			Company:      "FinTech Solutions",
			Location:     "Москва",
			Salary:       "200000-300000 руб.",
			Type:         "full-time",
			Category:     "IT",
			Requirements: "• Опыт работы с Go от 3 лет\n• Знание PostgreSQL, Redis\n• Опыт работы с Docker, Kubernetes\n• Понимание микросервисной архитектуры\n• Опыт работы с gRPC, REST API",
			Benefits:     "• Конкурентная зарплата\n• Медицинская страховка\n• Гибкий график работы\n• Возможность удаленной работы\n• Обучение и конференции",
			EmployerID:   2,
			IsActive:     true,
		},
		{
			Title:        "Frontend Developer (React)",
			Description:  "Развиваем платформу для онлайн-обучения. Нужен React разработчик для создания пользовательских интерфейсов.",
			Company:      "EduTech Startup",
			Location:     "Санкт-Петербург",
			Salary:       "150000-250000 руб.",
			Type:         "full-time",
			Category:     "IT",
			Requirements: "• Опыт работы с React от 2 лет\n• Знание TypeScript, Redux\n• Опыт работы с Material-UI или аналогичными библиотеками\n• Понимание принципов UX/UI\n• Опыт работы с REST API",
			Benefits:     "• Работа в стартапе с быстрым ростом\n• Опционы в компании\n• Современный офис в центре города\n• Команда молодых профессионалов",
			EmployerID:   3,
			IsActive:     true,
		},
		{
			Title:        "UI/UX Designer",
			Description:  "Создаем новый продукт в сфере e-commerce. Ищем талантливого дизайнера для создания пользовательских интерфейсов.",
			Company:      "ShopTech",
			Location:     "Москва",
			Salary:       "120000-180000 руб.",
			Type:         "full-time",
			Category:     "IT",
			Requirements: "• Опыт работы в UI/UX дизайне от 2 лет\n• Владение Figma, Sketch, Adobe Creative Suite\n• Понимание принципов пользовательского опыта\n• Опыт создания wireframes и прототипов\n• Портфолио с примерами работ",
			Benefits:     "• Творческая атмосфера\n• Возможность влиять на продукт\n• Современные инструменты\n• Команда дизайнеров",
			EmployerID:   2,
			IsActive:     true,
		},
		{
			Title:        "Digital Marketing Manager",
			Description:  "Развиваем digital-направление компании. Ищем маркетолога для работы с социальными сетями и контент-маркетингом.",
			Company:      "Marketing Agency",
			Location:     "Москва",
			Salary:       "80000-120000 руб.",
			Type:         "full-time",
			Category:     "Marketing",
			Requirements: "• Опыт работы в digital-маркетинге от 1 года\n• Знание SMM, Google Analytics, Яндекс.Метрики\n• Опыт создания контент-планов\n• Навыки копирайтинга\n• Понимание SEO основ",
			Benefits:     "• Работа с крупными клиентами\n• Возможность карьерного роста\n• Обучение новым инструментам\n• Гибкий график",
			EmployerID:   2,
			IsActive:     true,
		},
		{
			Title:        "DevOps Engineer",
			Description:  "Автоматизируем процессы разработки и развертывания. Ищем DevOps инженера для работы с облачной инфраструктурой.",
			Company:      "CloudTech",
			Location:     "Москва",
			Salary:       "180000-280000 руб.",
			Type:         "full-time",
			Category:     "IT",
			Requirements: "• Опыт работы с AWS/Azure/GCP\n• Знание Docker, Kubernetes\n• Опыт работы с CI/CD (GitLab CI, Jenkins)\n• Знание Terraform, Ansible\n• Опыт мониторинга (Prometheus, Grafana)",
			Benefits:     "• Работа с современными технологиями\n• Высокая зарплата\n• Возможность удаленной работы\n• Техническая команда",
			EmployerID:   3,
			IsActive:     true,
		},
		{
			Title:        "Junior Python Developer",
			Description:  "Развиваем платформу для анализа данных. Ищем начинающего Python разработчика для работы с машинным обучением.",
			Company:      "DataScience Corp",
			Location:     "Санкт-Петербург",
			Salary:       "100000-150000 руб.",
			Type:         "full-time",
			Category:     "IT",
			Requirements: "• Знание Python, pandas, numpy\n• Базовые знания машинного обучения\n• Опыт работы с SQL\n• Желание изучать новые технологии\n• Математическое образование приветствуется",
			Benefits:     "• Обучение и менторство\n• Работа с большими данными\n• Современный стек технологий\n• Возможность роста",
			EmployerID:   3,
			IsActive:     true,
		},
		{
			Title:        "Product Manager",
			Description:  "Управляем развитием мобильного приложения. Ищем продукт-менеджера для работы с командой разработки.",
			Company:      "MobileApp Inc",
			Location:     "Москва",
			Salary:       "150000-220000 руб.",
			Type:         "full-time",
			Category:     "IT",
			Requirements: "• Опыт работы в продуктовой разработке от 2 лет\n• Понимание Agile/Scrum методологий\n• Навыки аналитики и работы с метриками\n• Опыт работы с командой разработки\n• Техническое образование приветствуется",
			Benefits:     "• Управление продуктом с миллионами пользователей\n• Работа с международной командой\n• Высокая зарплата\n• Возможность влиять на стратегию",
			EmployerID:   2,
			IsActive:     true,
		},
		{
			Title:        "Content Manager",
			Description:  "Создаем контент для IT-блога и социальных сетей. Ищем контент-менеджера с техническим бэкграундом.",
			Company:      "TechBlog",
			Location:     "Москва",
			Salary:       "70000-100000 руб.",
			Type:         "part-time",
			Category:     "Marketing",
			Requirements: "• Опыт создания технического контента\n• Знание IT-трендов и технологий\n• Навыки копирайтинга\n• Опыт работы с социальными сетями\n• Техническое образование приветствуется",
			Benefits:     "• Гибкий график\n• Работа с интересными проектами\n• Возможность удаленной работы\n• Творческая свобода",
			EmployerID:   2,
			IsActive:     true,
		},
	}

	for _, job := range jobs {
		if err := db.Create(&job).Error; err != nil {
			log.Fatal("Failed to create job:", err)
		}
	}

	// Create test applications
	log.Println("Creating test applications...")
	applications := []JobApplication{
		{
			JobID:   1,
			UserID:  4,
			Status:  "pending",
			Message: "Здравствуйте! Меня очень заинтересовала вакансия Senior Go Developer. У меня есть опыт работы с Go и PostgreSQL, а также опыт работы с Docker. Готов к собеседованию!",
		},
		{
			JobID:   1,
			UserID:  6,
			Status:  "pending",
			Message: "Добрый день! Хотя у меня нет прямого опыта с Go, я быстро обучаюсь и имею опыт с Python. Готов изучить Go для этой позиции.",
		},
		{
			JobID:   2,
			UserID:  4,
			Status:  "accepted",
			Message: "Отличная вакансия! У меня есть опыт с React и TypeScript. Работал над похожими проектами в сфере образования.",
		},
		{
			JobID:   2,
			UserID:  5,
			Status:  "pending",
			Message: "Привет! Я UI/UX дизайнер, но также изучаю React. Могу привнести дизайнерский взгляд в разработку интерфейсов.",
		},
		{
			JobID:   3,
			UserID:  5,
			Status:  "accepted",
			Message: "Идеальная позиция для меня! У меня есть опыт создания интерфейсов для e-commerce проектов. Портфолио прилагаю.",
		},
		{
			JobID:   4,
			UserID:  6,
			Status:  "pending",
			Message: "Здравствуйте! У меня есть опыт в digital-маркетинге и SMM. Работал с различными инструментами аналитики.",
		},
		{
			JobID:   5,
			UserID:  4,
			Status:  "rejected",
			Message: "Интересная позиция, но у меня пока нет опыта с Kubernetes. Возможно, рассмотрите меня на более junior позицию?",
		},
		{
			JobID:   6,
			UserID:  4,
			Status:  "pending",
			Message: "Отличная возможность для роста! У меня есть базовые знания Python и желание изучать машинное обучение.",
		},
		{
			JobID:   7,
			UserID:  6,
			Status:  "pending",
			Message: "Хотя у меня нет прямого опыта в продуктовой разработке, я изучал Agile методологии и имею аналитический склад ума.",
		},
		{
			JobID:   8,
			UserID:  6,
			Status:  "accepted",
			Message: "Идеально подходит! У меня есть опыт создания технического контента и работы с IT-аудиторией.",
		},
	}

	for _, application := range applications {
		if err := db.Create(&application).Error; err != nil {
			log.Fatal("Failed to create application:", err)
		}
	}

	log.Println("Test data created successfully!")
	log.Println("Test accounts:")
	log.Println("Admin: admin@example.com / password123")
	log.Println("Employer 1: employer1@company.com / password123")
	log.Println("Employer 2: employer2@tech.com / password123")
	log.Println("Job Seeker 1: jobseeker1@email.com / password123")
	log.Println("Job Seeker 2: jobseeker2@email.com / password123")
	log.Println("Job Seeker 3: jobseeker3@email.com / password123")
}
