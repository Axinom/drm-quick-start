#!/usr/bin/env node

(function () {
    "use strict";

    const WEBSERVER_PORT = 8120;

    let secretManagement = require("./SecretManagement");
    secretManagement.tryLoadSecrets();

    let express = require("express");
    let app = express();

    // At /, we serve the website folder as static resources.
    app.use(express.static(__dirname + '/Website'));

    // At /api/website is the website's API that provides data for the frontend.
    let websiteApi = require("./WebsiteApi");
    app.use("/api/website", websiteApi.createRouter());

    // At /api/authorization is the authorization service.
    let authorizationServiceApi = require("./AuthorizationServiceApi");
    app.use("/api/authorization", authorizationServiceApi.createRouter());

    app.listen(WEBSERVER_PORT);

    console.log("The website is now available at http://localhost:" + WEBSERVER_PORT);
})();