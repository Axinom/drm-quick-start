# Axinom DRM - quick start
This guide will show you how you can start using Axinom DRM to protect and play back premium video content.

TODO

It is structured in the following chapters:

1. An overview of modern DRM architecture.
1. Using a sample project with everything already set up.
1. Creating and protecting your own videos.
1. Customizing the DRM configuration.
1. Key management and security practices.

# Basic concepts of DRM

This chapter presents a high-level functional view of DRM concepts. Understand that there is a lot more happening under the covers, especially in the realm of security and key management.

![](Images/Concepts - protected video.png)

The media samples in a protected video are encrypted with one or more **content keys**, each referenced in the video metadata by its unique key ID.

![](Images/Concepts - license.png)

To play the video, a DRM-capable player needs to decrypt the media samples. For this, it needs access to the concent keys, which are delivered in a **license** that also defines the conditions under which the content keys may be used (e.g. expiration).

![](Images/Concepts - license acquisition.png)

The Axinom DRM **license server** will give a license to every player who can prove that they have the right to get a license. The player proves this by presenting a **license token** obtained from an **authorization service** whose responsibility it is to make such decisions and to obtain the appropriate content keys from the **key server**, attaching them in a secured form to the license token.

# Solution components and Axinom DRM

The Axinom DRM product suite includes both a license server and a key server, offered as cloud services. The remaining parts of a DRM-enabled solution must be either 3rd party products or custom developed components.

You will want to use a robust and reliable player that provides an optimal playback experience. [dash.js](https://github.com/Dash-Industry-Forum/dash.js) integrates natively with Axinom DRM and can be used in all modern browsers that contain a compatible content decryption module. On Android, [ExoPlayer](https://github.com/google/exoplayer) is the recommended player. The player ecosystem on other platforms is less straightforward - contact Axinom for detailed player evaluation guidance.

# Sample scenario 1: ready to go

In the first scenario we explore, everything has been prepared for you - there exists a small website that has a single video that you can watch. All DRM information has been prepared for you and hardcoded into the application.

Follow the instructions below to run this sample project and go through the first sample scenario.

1. Install [node.js](https://nodejs.org) 
1. Clone or download this Git repository (the one that you are currently reading).
1. Open a terminal or command prompt window and go to the directory where you placed the repository's files (e.g. *C:\Source\drm-quick-start*).
1. Install required 3rd party packages by executing the following command: *npm install*
1. Run the application by executing the following command: *node Main.js*
1. If everything went well, the output from this command will give you the URL to open in your browser. It should be something like http://localhost:8120

The first sample scenario is very simple - once you open the website, there is a single link presented to you. Clicking on this link will play a protected video using Axinom DRM, assuming you open it in a DRM-capable browser.

## Understanding sample scenario 1

The code is thoroughly commented, so here is only a high-level overview. To understand the details, explore the source code!

TODO 

# Security omissions in sample code

To keep the sample code simple and straightforward, many critical website security measures are omitted (e.g. mandatory HTTPS, CSRF protection, any actual login/authentication). This is intentional, as the goal of the sample is to showcase interactions with Axinom DRM and the security of the website itself is not in focus.