#!/usr/bin/env node

(function () {
    "use strict";

    const WEBSERVER_DEFAULT_PORT = 8120;
    let port = process.env.PORT || WEBSERVER_DEFAULT_PORT;

    let secretManagement = require("./SecretManagement");
    secretManagement.tryLoadSecrets();

    let express = require("express");
    let app = express();

    // We disable etag as it causes API calls to be cached even with Cache-Control: no-cache.
    app.disable("etag");

    // At /, we serve the website folder as static resources.
    app.use(express.static(__dirname + '/Website'));

    // At /api/catalog is the catalog API that provides data for the frontend.
    let catalogApi = require("./CatalogApi");
    app.use("/api/catalog", catalogApi.createRouter());

    // At /api/authorization is the Entitlement Service.
    let entitlementService = require("./EntitlementService");
    app.use("/api/authorization", entitlementService.createRouter());

    app.listen(port);

    console.log("The website is now available at http://localhost:" + port);
    console.log("Press Control+C to shut down the application.");
})();