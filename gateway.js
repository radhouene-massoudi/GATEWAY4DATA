
const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000;
// Adresse du serveur de découverte qui retourne une liste de services disponibles
const discoveryServerUrl = 'http://localhost:4000/services';
// Middleware pour analyser le JSON dans le corps de la requête
app.use(express.json());
// Middleware pour définir la cible en fonction de la route
app.use(async (req, res, next) => {
    try {
        // Une requête HTTP est envoyée au serveur de découverte pour récupérer la liste des services disponibles
        const response = await axios.get('http://localhost:4000/services');
        
        // contient les données renvoyées par le serveur de découverte.
        const services = response.data;
       // console.log('Services disponibles :', services);
//Vérifie l'URL de la requête entrante pour déterminer quel service est visé
        if (req.path.startsWith('/service1')) {
            //Si l'URL commence par /service1, le service cible est MonMicroservice.
            req.targetService = services.find(service => service.name === 'service1');
        console.log('target service:', req.targetService)
        } else if (req.path.startsWith('/service2')) {
            req.targetService = services.find(service => service.name === 'service2');
        }
        
        if (req.targetService) {
            //Si le service est trouvé, son URL complète est construite (adresse + port) et ajoutée à req.
            req.targetServiceUrl = `${req.targetService.address}:${req.targetService.port}`;
            next();
        } else {
            //Sinon, une erreur 404 est retournée.
            res.status(404).send({ message: 'Microservice introuvable' });
        }
    } catch (error) {
        //En cas d'erreur de communication avec le serveur de découverte, une erreur 500 est renvoyée.
        res.status(500).send({ message: 'Erreur de communication avec le serveur de découverte' });
    }
});

// Rediriger les requêtes vers le microservice cible
app.use(async (req, res) => {
    try {
        const response = await axios({
            //Méthode HTTP (GET, POST, etc.) est conservée.
            method: req.method,
            url: `${req.targetServiceUrl}${req.originalUrl.replace(/^\/service[1-2]/, '')}`,
            data: req.body
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send({ message: 'Erreur lors de la communication avec le microservice' });
    }
});

// Lancer la passerelle
app.listen(port, () => {
    console.log(`Passerelle démarrée sur le port ${port}`);
});
