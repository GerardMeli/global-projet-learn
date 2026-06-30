# ============================================================
#  Stage 1 — Build
# ============================================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copier le pom en premier pour profiter du cache des dépendances
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copier les sources et compiler
COPY src ./src
RUN mvn clean package -DskipTests -q

# ============================================================
#  Stage 2 — Runtime
# ============================================================
FROM eclipse-temurin:17-jre-alpine

# Métadonnées
LABEL maintainer="ngandjougerard@gmail.com"
LABEL app="manage-users"

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copier le jar depuis le stage de build
COPY --from=builder /app/target/manage-users-*.jar app.jar

# Port exposé (doit correspondre à SERVER_PORT)
EXPOSE 8083

# Lancement avec support des variables d'environnement Spring
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]