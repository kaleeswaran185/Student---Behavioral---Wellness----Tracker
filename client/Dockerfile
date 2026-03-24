FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_DEMO_MODE=false
ARG VITE_API_BASE_URL=
ARG VITE_API_PROXY_TARGET=http://localhost:5000

ENV VITE_DEMO_MODE=${VITE_DEMO_MODE}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_PROXY_TARGET=${VITE_API_PROXY_TARGET}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
