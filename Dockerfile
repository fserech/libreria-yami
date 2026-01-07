# Etapa de construcción
FROM node:20.11.0-alpine3.18 as build-step

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm install

COPY . /app
RUN npm run build --prod

# Etapa de producción
FROM nginx:1.25.4-alpine

# Crear directorios de registro
RUN mkdir -p /var/log/nginx

# Copiar archivos construidos
COPY --from=build-step /app/dist/bodegasa-frontend/browser/ /usr/share/nginx/html/

# Establecer permisos
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html
RUN chown -R nginx:nginx /var/log/nginx
RUN chmod -R 755 /var/log/nginx

# Copiar configuración de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf
