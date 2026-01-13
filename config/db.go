package config

import (
	"exchangeapp/global"
	"log"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func InitDB() {
	dsn := AppConfig.Database.Dsn
	var db *gorm.DB
	var err error
	for i := 0; i < 20; i++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			sqlDB, err2 := db.DB()
			if err2 == nil {
				if err3 := sqlDB.Ping(); err3 == nil {
					sqlDB.SetMaxIdleConns(AppConfig.Database.MaxIdleConns)
					sqlDB.SetMaxOpenConns(AppConfig.Database.MaxOpenConns)
					sqlDB.SetConnMaxLifetime(time.Hour)
					global.Db = db
					return
				}
			}
		}
		time.Sleep(3 * time.Second)
	}
	log.Fatalf("Failed to initialize database, got error: %v", err)
}
