# Etapa de construcción
FROM node:20-alpine AS builder

# Habilitar pnpm y preparar entorno
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias de construcción
RUN pnpm install

# Copiar todo el código fuente
COPY . .

# Construir el proyecto (compilar TypeScript a JavaScript)
RUN pnpm exec tsc index.ts

# Imagen de producción
FROM node:20-alpine

# Habilitar pnpm y preparar entorno
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias de producción desde la etapa de construcción
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --production --frozen-lockfile

# Copiar el archivo compilado desde la etapa de construcción
COPY --from=builder /app/index.js ./index.js

# Copiar el archivo .env al contenedor
COPY .env .env

# Comando de inicio
CMD ["node", "index.js"]