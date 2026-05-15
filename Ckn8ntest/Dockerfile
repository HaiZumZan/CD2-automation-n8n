# ===== STAGE 1: Build JAR =====
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml trước để cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code và build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ===== STAGE 2: Run JAR =====
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Tạo thư mục uploads để lưu file
RUN mkdir -p /app/uploads

# Copy JAR từ stage build
COPY --from=builder /app/target/*.jar app.jar

# Expose port backend
EXPOSE 8081

# Biến môi trường mặc định (override bằng docker-compose)
ENV SPRING_PROFILES_ACTIVE=prod

# Chạy Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
