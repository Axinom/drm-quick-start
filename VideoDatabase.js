(function () {
    "use strict";

    // The responsibility of this module is to provide information about videos to other modules.

    // The videos are defined here. Add your videos to this list.
    let allVideos = [
        /*
        // Uncomment and copy-paste this block as an example for adding custom videos to the list.
        {
            "name": "My video 1",
            "url": "https://example.com/Manifest.mpd",
            "keys": [
                // NB! This sample contains the actual content keys for demo purposes only,
                // as integration with a key server is out of scope of this sample. In a
                // real production scenario, content keys are securely delivered from the
                // key server to the license server without being visible to the website
                // or to the authorization service.
                {
                    "keyId": "1c817fed-0686-45b6-bce2-d6a4eb873588",
                    "key": "YV5DwvbXdEU+HSwK+LN3DQ=="
                } 
            ]
        },
        */

        // This is a special video that uses a pre-generated license token. For adding your
        // own videos to the list, copy-paste the custom video example above instead of this one.
        {
            "name": "Axinom demo video",
            "url": "https://media.axprod.net/TestVectors/v6-MultiDRM/Manifest_1080p.mpd",
            // This video has a hardcoded license token, for maximum ease of use of the sample app.
            // Never do this in production - always generate a new license token on every request.
            "licenseToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZXJzaW9uIjoxLCJjb21fa2V5X2lkIjoiNjllNTQwODgtZTllMC00NTMwLThjMWEtMWViNmRjZDBkMTRlIiwibWVzc2FnZSI6eyJ0eXBlIjoiZW50aXRsZW1lbnRfbWVzc2FnZSIsImtleXMiOlt7ImlkIjoiNmU1YTFkMjYtMjc1Ny00N2Q3LTgwNDYtZWFhNWQxZDM0YjVhIn1dLCJwbGF5cmVhZHkiOnsibWluX2FwcF9zZWN1cml0eV9sZXZlbCI6MTUwLCJwbGF5X2VuYWJsZXJzIjpbIjc4NjYyN0Q4LUMyQTYtNDRCRS04Rjg4LTA4QUUyNTVCMDFBNyJdfX19.x8O3ntluLQ7iNM-hFXmdIY7Qd-6FX7MT2y4KOVFXHlU"
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
                if (!item.key)
                    throw new Error("A content key is missing the value of the key.");

                const CONTENT_KEY_SIZE_IN_BYTES = 16;
                let keyBuffer = Buffer.from(item.key, 'base64');
                if (keyBuffer.length !== CONTENT_KEY_SIZE_IN_BYTES)
                    throw new Error("The content key must consist of 16 bytes of data, base64-encoded.");
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
