package main

import (
	"exchangeapp/config"
	"exchangeapp/global"
	"exchangeapp/models"
	"exchangeapp/router"
	"log"
)

func migrate() {
	if err := global.Db.AutoMigrate(
		&models.Article{},
		&models.User{},
		&models.ExchangeRate{},
	); err != nil {
		log.Fatalf("migrate failed: %v", err)
	}
}

func main() {
	config.InitConfig()
	migrate()
	r := router.SetupRouter()
	port := config.AppConfig.App.Port

	if port == "" {
		port = ":8080"
	}
	r.Run(port)

}
