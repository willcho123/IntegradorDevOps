# ============================================
# Dockerfile para PRODUCCIÓN
# ============================================

# Imagen base de Bun
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Etapa de dependencias
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Etapa de producción
FROM base AS runner

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 bunjs && \
    adduser --system --uid 1001 bunjs

# Copiar dependencias instaladas
COPY --from=deps --chown=bunjs:bunjs /usr/src/app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=bunjs:bunjs . .

# Cambiar a usuario no-root
USER bunjs

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["bun", "run", "src/index.ts"]