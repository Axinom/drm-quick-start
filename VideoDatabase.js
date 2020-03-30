(function () {
    "use strict";

    // The responsibility of this module is to provide information about videos to other modules.

    // The videos are defined here. Add your videos to this list.
    let allVideos = [
        // Uncomment and copy-paste the block below as an example for adding custom
        // videos to the list.
        /*
        {
            "name": "My video 1",
            "url": "https://example.com/Manifest.mpd",
            "keys": [
                {
                    "keyId": "1c817fed-0686-45b6-bce2-d6a4eb873588",
                }
            ]
        }
        */

        // The following entries are for the pre-generated demo videos. To add your own videos, 
        // copy the sample video above, append to the list and adjust the fields as needed.
        //
        // Note: The demo videos have hardcoded license tokens for maximum ease of use of the
        // sample app. Never do this in production - always generate a new license token on
        // every request.

        // Note: the "tags" property is optional. The demo player uses this to filter the video
        // list -- for example, to only display FairPlay-compliant videos on Safari.
        {
            "name": "Axinom demo video - single key (DASH; cenc)",
            "url": "https://media.axprod.net/VTB/DrmQuickStart/AxinomDemoVideo-SingleKey/Encrypted_Cenc/Manifest.mpd",
            "licenseToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXJzaW9uIjoxLCJjb21fa2V5X2lkIjoiNjllNTQwODgtZTllMC00NTMwLThjMWEtMWViNmRjZDBkMTRlIiwibWVzc2FnZSI6eyJ2ZXJzaW9uIjoyLCJ0eXBlIjoiZW50aXRsZW1lbnRfbWVzc2FnZSIsImNvbnRlbnRfa2V5c19zb3VyY2UiOnsiaW5saW5lIjpbeyJpZCI6IjIxMWFjMWRjLWM4YTItNDU3NS1iYWY3LWZhNGJhNTZjMzhhYyIsInVzYWdlX3BvbGljeSI6IlRoZU9uZVBvbGljeSJ9XX0sImNvbnRlbnRfa2V5X3VzYWdlX3BvbGljaWVzIjpbeyJuYW1lIjoiVGhlT25lUG9saWN5IiwicGxheXJlYWR5Ijp7InBsYXlfZW5hYmxlcnMiOlsiNzg2NjI3RDgtQzJBNi00NEJFLThGODgtMDhBRTI1NUIwMUE3Il19fV19fQ.0OygPRGMlzYbbQJ_pEJSZ_scTRUsQzDPragUzf-mA5w",
        },
		{
            "name": "Axinom demo video - single key (HLS; cbcs)",
            "url": "https://media.axprod.net/VTB/DrmQuickStart/AxinomDemoVideo-SingleKey/Encrypted_Cbcs/Manifest.m3u8",
            "licenseToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXJzaW9uIjoxLCJjb21fa2V5X2lkIjoiNjllNTQwODgtZTllMC00NTMwLThjMWEtMWViNmRjZDBkMTRlIiwibWVzc2FnZSI6eyJ2ZXJzaW9uIjoyLCJ0eXBlIjoiZW50aXRsZW1lbnRfbWVzc2FnZSIsImNvbnRlbnRfa2V5c19zb3VyY2UiOnsiaW5saW5lIjpbeyJpZCI6IjIxMWFjMWRjLWM4YTItNDU3NS1iYWY3LWZhNGJhNTZjMzhhYyIsInVzYWdlX3BvbGljeSI6IlRoZU9uZVBvbGljeSJ9XX0sImNvbnRlbnRfa2V5X3VzYWdlX3BvbGljaWVzIjpbeyJuYW1lIjoiVGhlT25lUG9saWN5IiwicGxheXJlYWR5Ijp7InBsYXlfZW5hYmxlcnMiOlsiNzg2NjI3RDgtQzJBNi00NEJFLThGODgtMDhBRTI1NUIwMUE3Il19fV19fQ.0OygPRGMlzYbbQJ_pEJSZ_scTRUsQzDPragUzf-mA5w",
            "tags": ["FairPlay"]
        },
        {
            "name": "Axinom demo video - multikey (DASH; cenc)",
            "url": "https://media.axprod.net/VTB/DrmQuickStart/AxinomDemoVideo-MultiKey/Encrypted_Cenc/Manifest.mpd",
            "licenseToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXJzaW9uIjoxLCJjb21fa2V5X2lkIjoiNjllNTQwODgtZTllMC00NTMwLThjMWEtMWViNmRjZDBkMTRlIiwibWVzc2FnZSI6eyJ2ZXJzaW9uIjoyLCJ0eXBlIjoiZW50aXRsZW1lbnRfbWVzc2FnZSIsImNvbnRlbnRfa2V5c19zb3VyY2UiOnsiaW5saW5lIjpbeyJpZCI6ImYzZDU4OGM3LWMxN2EtNDAzMy05MDM1LThkYjMxNzM5MGJlNiIsInVzYWdlX3BvbGljeSI6IlRoZU9uZVBvbGljeSJ9LHsiaWQiOiI0NGIxOGEzMi02ZDM2LTQ5OWQtOGI5My1hMjBmOTQ4YWM1ZjIiLCJ1c2FnZV9wb2xpY3kiOiJUaGVPbmVQb2xpY3kifSx7ImlkIjoiYWU2ZTg3ZTItM2MzYy00NmQxLThlOWQtZWY0YzQ2MWQ0NjgxIiwidXNhZ2VfcG9saWN5IjoiVGhlT25lUG9saWN5In1dfSwiY29udGVudF9rZXlfdXNhZ2VfcG9saWNpZXMiOlt7Im5hbWUiOiJUaGVPbmVQb2xpY3kiLCJwbGF5cmVhZHkiOnsicGxheV9lbmFibGVycyI6WyI3ODY2MjdEOC1DMkE2LTQ0QkUtOEY4OC0wOEFFMjU1QjAxQTciXX19XX19.wNvPBVnPRCaJhuHywyVyvkON9p2YpdG9AiIyLA9Sv3M",
        },
        {
            "name": "Axinom demo video - multikey (HLS; cbcs)",
            "url": "https://media.axprod.net/VTB/DrmQuickStart/AxinomDemoVideo-MultiKey/Encrypted_Cbcs/Manifest.m3u8",
            "licenseToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXJzaW9uIjoxLCJjb21fa2V5X2lkIjoiNjllNTQwODgtZTllMC00NTMwLThjMWEtMWViNmRjZDBkMTRlIiwibWVzc2FnZSI6eyJ2ZXJzaW9uIjoyLCJ0eXBlIjoiZW50aXRsZW1lbnRfbWVzc2FnZSIsImNvbnRlbnRfa2V5c19zb3VyY2UiOnsiaW5saW5lIjpbeyJpZCI6ImYzZDU4OGM3LWMxN2EtNDAzMy05MDM1LThkYjMxNzM5MGJlNiIsInVzYWdlX3BvbGljeSI6IlRoZU9uZVBvbGljeSJ9LHsiaWQiOiI0NGIxOGEzMi02ZDM2LTQ5OWQtOGI5My1hMjBmOTQ4YWM1ZjIiLCJ1c2FnZV9wb2xpY3kiOiJUaGVPbmVQb2xpY3kifSx7ImlkIjoiYWU2ZTg3ZTItM2MzYy00NmQxLThlOWQtZWY0YzQ2MWQ0NjgxIiwidXNhZ2VfcG9saWN5IjoiVGhlT25lUG9saWN5In1dfSwiY29udGVudF9rZXlfdXNhZ2VfcG9saWNpZXMiOlt7Im5hbWUiOiJUaGVPbmVQb2xpY3kiLCJwbGF5cmVhZHkiOnsicGxheV9lbmFibGVycyI6WyI3ODY2MjdEOC1DMkE2LTQ0QkUtOEY4OC0wOEFFMjU1QjAxQTciXX19XX19.wNvPBVnPRCaJhuHywyVyvkON9p2YpdG9AiIyLA9Sv3M",
            "tags": ["FairPlay"]
        }
    ];

    // Verifies that all critical information is present on a video.
    // Automatically performs sanity checks to avoid making mistakes in the above list. 
    function verifyVideoIntegrity(video) {
        if (!video)
            throw new Error("A video was expected but was not present.");
        if (!video.name || !video.name.length)
            throw new Error("A video is missing its name.");

        console.log("Verifying integrity of video definition: " + video.name);

        if (!video.url || !video.url.length)
            throw new Error("The video is missing its URL.");

        // Either a hardcoded license token or the keys structure must exist. Not both.
        if (video.licenseToken && video.keys)
            throw new Error("The video has both a hardcoded license token and a content key list - pick only one.");
        if (!video.licenseToken && !video.keys)
            throw new Error("The video is missing the content key list.");

        if (video.keys) {
            if (!video.keys.length)
                throw new Error("The content key list for this video is empty.");

            // Verify that each item in the keys list has all the required data.
            video.keys.forEach(function verifyKey(item) {
                if (!item.keyId)
                    throw new Error("A content key is missing the key ID.");
            });
        }
    }

    // Verify all videos on startup.
    allVideos.forEach(verifyVideoIntegrity);

    module.exports = {
        "getAllVideos": function getAllVideos() {
            return allVideos;
        },
        "getVideoByName": function getVideoByName(name) {
            return allVideos.find(function filter(item) {
                return item.name === name;
            });
        }
    };
})();