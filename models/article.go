package models

import "gorm.io/gorm"

type Article struct {
	gorm.Model
	Title   string `binding:"required"`
	Content string `binding:"required"`
	Preview string
	Likes   int    `gorm:"default:0"`
}
