# --- Etape 1 : build Angular ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# URL du backend injectee au build (l'app Angular est statique : la valeur est
# figee dans le bundle JS a la compilation, pas lue depuis l'environnement du
# conteneur au demarrage). Par defaut une URL relative : nginx (voir nginx.conf)
# proxie /api/ vers le conteneur backend sur le meme hote EC2, donc le
# navigateur ne voit qu'une seule origine. Surchargez avec --build-arg
# API_BASE_URL=... si le backend est ailleurs.
ARG API_BASE_URL=/api
RUN sed -i "s#apiBaseUrl: '.*'#apiBaseUrl: '${API_BASE_URL}'#" src/environments/environment.prod.ts

RUN npm run build -- --configuration production

# --- Etape 2 : image d'execution (nginx non-root) ---
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend-angular/browser /usr/share/nginx/html

EXPOSE 8080
