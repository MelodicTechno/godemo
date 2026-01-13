package middlewares

import "github.com/gin-gonic/gin"

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.Status(204)
			return
		}
		c.Next()
	}
}
