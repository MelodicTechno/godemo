FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY postcss.config.cjs ./
COPY tailwind.config.cjs ./
COPY index.html ./

# Install dependencies first (better caching)
RUN npm ci

COPY src ./src
COPY public ./public

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

