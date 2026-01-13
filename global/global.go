package global

import (
	"github.com/go-redis/redis"
	"gorm.io/gorm"
)

var (
	Db *gorm.DB
	Redis *redis.Client
)