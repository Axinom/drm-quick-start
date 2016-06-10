#!/usr/bin/env node

(function () {
    "use strict";

    let uuid = require("node-uuid");
    let crypto = require("crypto");

    const CONTENT_KEY_LENGTH_IN_BYTES = 16;

    let keyId = uuid.v4();
    let key = crypto.randomBytes(CONTENT_KEY_LENGTH_IN_BYTES);

    console.log("Key ID: " + keyId);
    console.log("Key: " + key.toString("base64"));
})();
