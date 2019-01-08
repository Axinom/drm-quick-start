(function () {
	"use strict";

	let express = require("express");
	let videoDatabase = require("./VideoDatabase");
	let secretManagement = require("./SecretManagement");
	let jwt = require("jsonwebtoken");
	let crypto = require("crypto");
	let uuid = require("node-uuid");
	let moment = require("moment");

	const NO_SUCH_VIDEO_STATUS_CODE = 400;
	const NEED_TO_KNOW_SECRETS_STATUS_CODE = 500;

	module.exports = {
		"createRouter": function createRouter() {
			let router = express.Router();

			// This API call returns the license token for playing back a video.
			// The web app provides the name of the video as a parameter in the URL.
			router.get("/:videoName", function processGet(request, response) {
				// We do not want our API calls to get cached.
				response.header("Cache-Control", "no-cache");

				let video = videoDatabase.getVideoByName(request.params.videoName);

				if (!video) {
					response.status(NO_SUCH_VIDEO_STATUS_CODE).send("No such video");
					return;
				}

				// TODO: Check here if the user is actually authorized to watch this video. For example, you could
				// check a database of purchases to see if the currently logged-in user made a relevant purchase
				// for this product. For demo purposes, however, everyone is always authorized to watch every video.

				if (video.licenseToken) {
					// If the video has a license token hardcoded, just give that to all callers.
					// Strictly for demo purposes only - never do this in real world usage.
					response.json(video.licenseToken);
					return;
				}

				// If we got here, the user is authorized and we need to generate a license token.

				if (!secretManagement.areSecretsAvailable()) {
					console.log("ERROR: You must configure the secrets file to generate license tokens.");
					response.status(NEED_TO_KNOW_SECRETS_STATUS_CODE)
						.send("You must configure the secrets file to generate license tokens.");
					return;
				}

				let secrets = secretManagement.getSecrets();
				let communicationKeyAsBuffer = Buffer.from(secrets.communicationKey, "base64");

				// We allow this token to be used within plus or minus 24 hours. This allows for a lot of
				// clock drift, as your demo server might not be properly real-time synced across the world.
				// In production scenarios, you should limit the use of the license token much more strictly.
				// The time limit defined here applies both to the license token and to any generated licenses,
				// though it is possible to control them separately in situations where that is desired.
				let now = moment();
				let validFrom = now.clone().subtract(1, "days");
				let validTo = now.clone().add(1, "days");

				// For detailed information about these fields, refer to Axinom DRM documentation.
				// There exist many possibilities for further customization of the license token - the settings
				// shown here are only the bare minimum to create a license token suitable for realistic use.
				let message = {
					"type": "entitlement_message",
					"version": 2,
					"license": {
						"start_datetime": validFrom.toISOString(),
						"expiration_datetime": validTo.toISOString(),
					},

					// The keys list will be filled separately by the next code block.
					"content_keys_source": {
						"inline": [
						]
					},
					
					// License configuration should be as permissive as possible for the scope of this guide.
					// For this reason, some PlayReady-specific restrictions are relaxed below.
					// There is no need to relax the default Widevine-specific restrictions.
					"content_key_usage_policies": [
						{
							"name": "Policy A",
							"playready": {
								"min_device_security_level": 150, // Allow playback on non-production devices.
								"play_enablers": [ // Allow playback in virtual machines.
									"786627D8-C2A6-44BE-8F88-08AE255B01A7"
								]
							},
							"widevine": {
							}
						}
					]
				};

				// Now we embed all the content keys into the license token, for later use by the license server.
				// 
				// All the content keys in the license token are encrypted, of course, so they are not
				// readable to any browser-side JavaScript code. There is no way to send content keys
				// in the clear with Axinom DRM, even for testing purposes - encryption is always required.
				// 
				// NB! In a production implementation, you would retrieve a key container from the key server
				// and embed that, to avoid the keys becoming known to the authorization service. For sample
				// purposes, this is omitted and the keys are directly available in the video database.
				video.keys.forEach(function (key) {
					// The content key itself is what we encrypt.
					let contentKeyAsBuffer = Buffer.from(key.key, "base64");

					// The Key ID is used as the IV, in big-endian serialized format.
					let keyIdAsBuffer = Buffer.from(uuid.parse(key.keyId));

					// The communication key is the encryption key that secures the content key in transit.
					let encryptor = crypto.createCipheriv("aes-256-cbc", communicationKeyAsBuffer, keyIdAsBuffer);
					// No padding is to be used.
					encryptor.setAutoPadding(false);

					let encryptedKeyAsBuffer = encryptor.update(contentKeyAsBuffer);
					encryptedKeyAsBuffer = Buffer.concat([encryptedKeyAsBuffer, encryptor.final()]);

					message.content_keys_source.inline.push({
						"id": key.keyId,
						"encrypted_key": encryptedKeyAsBuffer.toString("base64"),
						"usage_policy": "Policy A"
					});
				});

				// For detailed information about these fields, refer to Axinom DRM documentation.
				let envelope = {
					"version": 1,
					"com_key_id": secrets.communicationKeyId,
					"message": message
				};

				console.log("Creating license token with payload: " + JSON.stringify(envelope));

				// The license token must be digitally signed to prove that it came from the authorization service.
				let licenseToken = jwt.sign(envelope, communicationKeyAsBuffer, {
					"algorithm": "HS256",
					"noTimestamp": true
				});

				response.json(licenseToken);
			});

			return router;
		}
	};
})();