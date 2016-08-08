(function () {
	"use strict";

	let express = require("express");
	let videoDatabase = require("./VideoDatabase");

	module.exports = {
		"createRouter": function createRouter() {
			let router = express.Router();

			// This API call returns a JSON list with basic info about all the videos on the website.
			router.get("/videos", function processGet(request, response) {
				// We do not want our API calls to get cached.
				response.header("Cache-Control", "no-cache");
				
				let videoList = [];

				videoDatabase.getAllVideos().forEach(function mapVideo(video) {
					// Only name and URL are exposed to the browser. Everything else is for internal use only.
					videoList.push({
						"name": video.name,
						"url": video.url
					});
				});				

				response.json(videoList);
			});

			return router;
		}
	};
})();