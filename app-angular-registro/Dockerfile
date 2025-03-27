# usa una imagen oficial de node.js para construir angular
FROM node:18 AS build

# define argumentos para la configuracion de firebase
ARG FIREBASE_PROJECT_ID
ARG FIREBASE_APP_ID
ARG FIREBASE_STORAGE_BUCKET
ARG FIREBASE_API_KEY
ARG FIREBASE_AUTH_DOMAIN
ARG FIREBASE_MESSAGING_SENDER_ID
ARG FIREBASE_MEASUREMENT_ID

# establece el directorio de trabajo
WORKDIR /app

# copia los archivos necesarios e instala dependencias
COPY package*.json ./
RUN npm install

# copia el código fuente
COPY . .

# genera dinamicamente el archivo de configuración de firebase ya que está en git ignore
RUN echo "export const firebaseConfig = {" \
    "projectId: \"$FIREBASE_PROJECT_ID\"," \
    "appId: \"$FIREBASE_APP_ID\"," \
    "storageBucket: \"$FIREBASE_STORAGE_BUCKET\"," \
    "apiKey: \"$FIREBASE_API_KEY\"," \
    "authDomain: \"$FIREBASE_AUTH_DOMAIN\"," \
    "messagingSenderId: \"$FIREBASE_MESSAGING_SENDER_ID\"," \
    "measurementId: \"$FIREBASE_MEASUREMENT_ID\"" \
    "};" > src/environments/firebase.config.ts

# construye la aplicación angular
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

# comando para ejecutar el servidor
CMD ["serve", "-s", "/app", "-l", "8080", "--single"]