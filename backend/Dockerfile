# Use official Maven image to build the app
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# 2. Run Stage
# CHANGED: Using the standard 'jammy' (Ubuntu-based) image instead of 'alpine'
# This fixes the Netty/tcnative crash with Firebase.
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/Circuithub-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
