(function () {
	"use strict";

	let express = require("express");

	const NO_SUCH_VIDEO_STATUS_CODE = 400;

	module.exports = {
		"createRouter": function createRouter(videoDatabase) {
			let router = express.Router();

			// This API call returns the license token for playing back a video.
			// The web app provides the name of the video as a parameter in the URL.
			router.get("/:videoName", function processGet(request, response) {
				// TODO: Check if the user is actually authorized to watch this video. For example, you could
				// check a database of purchases to see if the currently logged-in user made a relevant purchase
				// for this product. For demo purposes, however, everyone is always authorized to watch every video.

				let video = videoDatabase.getVideoByName(request.params.videoName);

				if (!video) {
					response.status(NO_SUCH_VIDEO_STATUS_CODE).send("No such video");
					return;
				}

				if (video.licenseToken) {
					// If the video has a license token hardcoded, just give that to all callers.
					// Strictly for demo purposes only - never do this in real world usage.
					response.json(video.licenseToken);
					return;
				}

				// If we got here, the user is authorized and we need to generate a license token.

				// NB! In a production implementation, you would retrieve a key container from the key server
				// and embed that, to avoid the keys becoming known to the authorization service. For sample
				// purposes, this is omitted and the keys are directly available in the video database.

				response.json("TODO: generate license token");
			});

			return router;
		}
	};
})();