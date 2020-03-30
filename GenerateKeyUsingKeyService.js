#!/usr/bin/env node

(function () {
	"use strict";

	let program = require("commander");
	let uuid = require("node-uuid");
	let crypto = require("crypto");
	let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	
	program
		.usage('--signer <string> --signing-key <64-character_hex_value> --signing-iv <32-character_hex_value>')
		.option('--signer <string>', 'the signer of the content key request (required). Example: "widevine_test".')
		.option('--signing-key <64-character_hex_value>', 'the 32-byte signing key as hex (required). Example: "0000000000000000000000000000000000000000000000000000000000000000".')
		.option('--signing-iv <32-character_hex_value>', 'the 16-byte signing IV as hex (required). Example: "00000000000000000000000000000000".')
		.parse(process.argv);

	if (!program.signer || !program.signingKey || !program.signingIv) {
		program.outputHelp();
		return;
	}
	
	let keyServerUrl = "https://key-server-management.axtest.net/api/WidevineProtectionInfo";
	
	let contentId = Buffer.from(uuid.v4(), "ascii").toString("base64");
	let signingKey = Buffer.from(program.signingKey, "hex");
	let signingIv = Buffer.from(program.signingIv, "hex");
	let signer = program.signer;
	
	let contentKeyRequest = JSON.stringify(
	{
		"content_id": contentId,
		"tracks": [{ "type": "SD" }]
	});

	// Generate signature
	let hash = crypto.createHash("sha1").update(Buffer.from(contentKeyRequest)).digest();
	let cipher = crypto.createCipheriv("aes-256-cbc", signingKey, signingIv);
	let encryptedHash = cipher.update(hash, "", "hex");
	encryptedHash += cipher.final("hex");
	let signature = Buffer.from(encryptedHash, "hex").toString("base64");
	
	let keyServerRequest = JSON.stringify(
	{
		"request": Buffer.from(contentKeyRequest).toString("base64"),
		"signature": signature,
		"signer": signer
	});
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", keyServerUrl, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				try {
					let contentKeyResponseBase64 = JSON.parse(xhr.responseText).response;
					let contentKeyResponse = JSON.parse(Buffer.from(contentKeyResponseBase64, "base64").toString("ascii"));

					let keyIdBase64 = contentKeyResponse.tracks[0].key_id;
					let keyBase64 = contentKeyResponse.tracks[0].key;
					let keyIdUuid = uuid.unparse(Buffer.from(keyIdBase64, "base64"));
					let pssh = contentKeyResponse.tracks[0].pssh[0].data;
				
					console.log();
					console.log("Key ID: " + keyIdUuid);
					console.log("Key: " + keyBase64);
					console.log();
					console.log("Widevine PSSH data: " + pssh);
				} catch (err) {
					console.log("Error: Key server refused to return a content key. Check the correctness of input parameters and try again. Contact Axinom if the issue persists.");
				}
			} else {
				console.log("Error: Content key request to key server failed with code " + xhr.status + ". Contact Axinom to troubleshoot the issue.");
			}
		}
	};
	
	xhr.send(keyServerRequest);
})();
