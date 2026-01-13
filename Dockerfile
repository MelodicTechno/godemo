# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Set GOPROXY for faster dependency downloads in China
ENV GOPROXY=https://goproxy.cn,direct

# Download all dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the Go app
RUN go build -o main .

# Run stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/main .

# Copy config directory
COPY --from=builder /app/config ./config

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["./main"]
