# usa una imagen oficial de node.js para construir angular
FROM node:18 AS build

# establece el directorio de trabajo
WORKDIR /app

# copia los archivos necesarios e instala dependencias
COPY package*.json ./
RUN npm install

# copia el código fuente y construye la aplicación angular
COPY . .
RUN npm run build -- --configuration=production

# usa una imagen limpia de node.js para el entorno final
FROM node:18

# establece el directorio de trabajo en la nueva imagen
WORKDIR /app

# instala serve para servir la aplicación sin express
RUN npm install -g serve

# copia los archivos construidos desde la fase anterior
COPY --from=build /app/dist/app-angular-registro/browser /app

# expone el puerto 8080 (cloud run usa este puerto por defecto)
EXPOSE 8080

# comando para ejecutar el servidor (corregido)
CMD ["serve", "-s", "/app", "-l", "8080", "--single"]
