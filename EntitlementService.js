const { json } = require("stream/consumers");

(function () {
	"use strict";

	let express = require("express");
	let videoDatabase = require("./VideoDatabase");
	let secretManagement = require("./SecretManagement");
	let jwt = require("jsonwebtoken");
	let crypto = require("crypto");
	const { validate, parse } = require('uuid');
	let moment = require("moment");

	const NO_SUCH_VIDEO_STATUS_CODE = 400;
	const NEED_TO_KNOW_SECRETS_STATUS_CODE = 500;

	const secrets = secretManagement.getSecrets();
	const communicationKeyAsBuffer = Buffer.from(secrets.communicationKey, "base64");

	
	function generateEncryptedKey(keyIdBase64, contentKeyBase64) {

		const key = Buffer.from(contentKeyBase64, 'base64'); // Content key, 16 bytes
		const iv = convertToIv(keyIdBase64); // IV is keyId in big-endian byte order (16 bytes)

		console.log('key.length',key.length);

		if (key.length !== 16) throw new Error("Content key must be 16 bytes.");
		if (iv.length !== 16) throw new Error("IV must be 16 bytes.");
		if (communicationKeyAsBuffer.length !== 32) throw new Error("Communication key must be 32 bytes.");

		const cipher = crypto.createCipheriv('aes-256-cbc', communicationKeyAsBuffer, iv);
		cipher.setAutoPadding(false); // No padding as required
		const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);

		return encrypted.toString('base64');
	}

	function convertToIv(input) {
		if (typeof input !== 'string') {
			throw new TypeError(`Expected keyId to be a string. Got: ${typeof input}`);
		}

		// Check if it's a UUID string
		if (validate(input)) {
			return Buffer.from(parse(input)); // always 16 bytes
		}

		// Try treating as base64
		let raw;
		try {
			raw = Buffer.from(input, 'base64');
		} catch (e) {
			throw new Error(`Invalid base64 input: ${input}`);
		}

		if (raw.length === 16) {
			return raw;
		} else if (raw.length > 16) {
			return raw.slice(0, 16);
		} else {
			throw new Error(`Decoded IV too short: ${raw.length} bytes. Must be at least 16.`);
		}
	}

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
						"allow_persistence": true
					},

					// The keys list will be filled separately by the next code block.
					"content_keys_source": {
						"inline": [
						]
					},
					
					// License configuration should be as permissive as possible for the scope of this guide.
					// For this reason, some PlayReady-specific restrictions are relaxed below.
					// There is no need to relax the default Widevine or FairPlay specific restrictions.
					"content_key_usage_policies": [
						{
							"name": "Policy A",
							"playready": {
								// Allow playback on non-production devices.
								"min_device_security_level": 150,
								// Allow playback in virtual machines.
								"play_enablers": [
									"786627D8-C2A6-44BE-8F88-08AE255B01A7"
								]
							}
						}
					]
				};

				// Now we embed the content key information (IDs and usage policies) into the license token.
				// For more information on this topic, refer to Axinom DRM documentation.

				video.keys.forEach(function (key) {
					// A key ID is always required. In this demo, we'll also reference the previously defined
					// key usage policy.
					let inlineKey = {
						"id": key.keyId,
						"usage_policy": "Policy A"
					};

					if (key.key) {
						let encryptedKey = generateEncryptedKey(
							key.keyId,      // base64-encoded Key ID (must decode to 16 bytes)
							key.key
						);
						inlineKey["encrypted_key"] = encryptedKey;
					}

					message.content_keys_source.inline.push(inlineKey);
				});

				// For detailed information about these fields, refer to Axinom DRM documentation.
				let envelope = {
					"version": 1,
					"com_key_id": secrets.communicationKeyId,
					"message": message,
					"begin_date": validFrom.toISOString(),
					"expiration_date": validTo.toISOString()
				};

				console.log("Creating license token with payload: " + JSON.stringify(envelope));

				// The license token must be digitally signed to prove that it came from the token service.
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