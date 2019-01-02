(function () {
	"use strict";

	const COMMUNICATION_KEY_LENGTH_IN_BYTES = 32;
	const SECRETS_FILE_NAME = "Secrets.json";

	// Global variable with loaded secrets.
	let secrets = null;

	module.exports = {
		"getSecrets": function getSecrets() {
			return secrets;
		},
		"areSecretsAvailable": function areSecretsAvailable() {
			return secrets !== null;
		},
		// Attempts to load the secrets from Secrets.json, if the file exists.
		// It is okay if it does not exist - hardcoded sample videos will still work.
		"tryLoadSecrets": function tryLoadSecrets() {
			let fs = require("fs");

			if (!fs.existsSync(SECRETS_FILE_NAME)) {
				console.log("No " + SECRETS_FILE_NAME + " file found - only the built-in sample videos can be viewed.");
				return;
			} else {
				console.log("Loading " + SECRETS_FILE_NAME + " file.");

				secrets = require("./" + SECRETS_FILE_NAME);
			}

			if (!secrets.communicationKeyId)
				throw new Error(SECRETS_FILE_NAME + " validation failed: communicationKeyId field is missing.");
			if (!secrets.communicationKey)
				throw new Error(SECRETS_FILE_NAME + " validation failed: communicationKey field is missing.");

			var communicationKeyBuffer = Buffer.from(secrets.communicationKey, 'base64');
			if (communicationKeyBuffer.length !== COMMUNICATION_KEY_LENGTH_IN_BYTES)
				throw new Error(SECRETS_FILE_NAME + " validation failed: communicationKey did not contain " + COMMUNICATION_KEY_LENGTH_IN_BYTES + " bytes of base64-encoded data.");

			if (secrets.communicationKeyId === "cffd95ba-aada-445b-b4ad-e8f322cf576a"
				|| secrets.communicationKey === "CSse/WF3BgKDPhYhRRqZCSse/WF3BgKDPhYhRRqZmZk=")
				throw new Error("You need to replace the example values in " + SECRETS_FILE_NAME + " with your own!");
		}
	};
})();