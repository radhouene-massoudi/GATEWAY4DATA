# Utiliser une image Node.js basée sur Ubuntu
FROM node:20-bullseye

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port 4000 (ou celui utilisé par votre application)
EXPOSE 5000

# Commande pour lancer l'application
CMD ["node", "gateway"]
