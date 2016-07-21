# CordovaUniversalAppServer
This is a Cordova/PhoneGap environment, which allows you to update Android and iOS apps on-the-fly and allows A-B testing of User Interfaces/Features.

#Summary
This solution allows Cordova/PhoneGap developers to update their mobile apps on-the-fly and run multiple versions of at the same time, without needing to go through Google Play/Apple AppStore. It also allows A-B testing of features and/or User Experiences, as the same app bundle can display different hosted versions of the app, depending on how it identifies itself to the App Server.

#How it works

![alt tag](https://raw.githubusercontent.com/rogerdcarvalho/CordovaUniversalAppServer/master/Illustration.png)

This solution consists of 2 elements.

1. A php-based server solution, which serves different versions of the apps to mobile clients
2. A Cordova/Phonegap based client solution, which connects to the server to load whatever code is hosted. 

Whenever a user opens the app, the app connects to the server to find out what code it should load. The app identifies itself and its current version to the server, and the server then checks if there is a newer version of the code available for that specific app. If this is the case, the app replaces its own code with that which was offered by the server. If the app is offline, it will just load whatever code was bundled with it. If anything goes wrong while trying to download a newer version, it also gracefully reverts to the bundled code. You can decide if the app should just update code automatically without informing the user, or whether the user should be asked if they want to upgrade. You can also use the app server to simply redirect the user to the appstore/google play and upgrade from there.

You can create as many branches on the App Server as you like, which means that 1 client 'Release' can have many different flavors. In the default configuration, I set it up with 4 branches: dev, alpha, beta and production. The idea is you give certain users an app that identifies itself to the server as 'dev', 'alpha' or 'beta' (usually through TestFlight or sideloaded apks) and you release the 'production' identifying app to the AppStore/Google Play. Now, whenever you fix bugs or want to test features, all you have to do is upload the cordova 'www' folder to one of the branches your AppServer, give it a version number, and the next time a user opens the app, it will automatically update itself. This can be a very effective way to have users test your apps.

Another way this solution can be useful is it allows for A/B testing. You could load a 'testable' UX change or feature to your AppServer for a limited time, measure how many times it is downloaded, and then replace it. This way you will have an active user base that is split between different versions of your app. If you're using some form of analytics in your app, you can gain useful insights from comparing usage of different version at the same time. 

The actual code of your app is stored in the 'www/bundle' directory of the client directory, the rest of the contents of the'www' folder are used to interact with the app server. The app will thus load index.html within 'www/bundle' if the app is offline or if there is no newer version available on the server. 

The most important files to read through to understand the way this all works are 'index.php' in the server directory and 'www/js/index.js' and 'www/js/filemanager.js/' in the client directory. Also look at 'version.ini' in each of the branch subdirectories of the server to see how the server handles versioning of bundles.

#How to use
- Simply upload the contents of the server directory to your own server. The contents of the server directory are for 4 template branches of a sample Cordova/PhoneGap app, being 'alpha', 'beta', 'dev' and 'production'. In your implementation you can have as many branches as you'd like, that can serve AB-Testing or whichever form of product differentiation suits your app. All you have to do is create a new directory within either ios or android on the server.

- Next, open client/www/js/index.js and enter the domain/ip address of your server (make sure you end it with a '/', other wise the client will not correctly download bundles.):
```
var remoteServer = "http://yourserver.com/";
//The server that is hosting the universal appserver api. Ensure it is the root directory of any hosted releases and that it ends with a '/'
```
(index.js, line 27).
Then build the app and run it on either Android or iOS. You will see that the app automatically integrates and runs the code that is hosted on your server under the directory 'beta' folder. You can change which folder it looks at by changing 
```
var clientType = "beta";
//The type of updates this app will download. Default options are dev, alpha, beta and production. 
//You can add any additional types to support A/B testing or user group specific versions
```
(index.js, line 29).

- To host your own app instead of the sample code, simply build your solution with phonegap, and copy the contents of 'platforms/ios/www' or 'platforms/android/www' to the 'www/bundle' directory of the client and server directories 'alpha', 'beta', 'dev' or 'production'. It is important to use the 'platforms/www'directory instead of the default 'www' directory.

- The app only downloads versions from the server that are newer than the version locally stored. To manage versioning, each branch directory on the server should have a version.ini in it.

#Version.ini
Each branch of your code should have a file in the root called 'version.ini'. This is used by the server to determine if the client should update or not. 'version.ini' has the following options:

- version = The version number of this bundle. Ensure you update this with every new bundle to ensure it ships!
- upgradeTitle = If you indicate in the client that the user should be asked whether or not to upgrade, the title of the popup asking the user to upgrade can be defined on the server
- upgradeMessage = If you indicate in the client that the user should be asked whether or not to upgrade, the body text of the popup asking the user to upgrade can be defined on the server
- forceUpgrade = (true or false) Upgrade mechanism. By default, the app will always ask users if they want to upgrade. However, you can force an automatic upgrade by setting this flag to 'true' and indicating in the client that this is allowed

```
window.allowAutoUpdate = true;
//Whether this app will support auto update. If enabled, the server can initiate an app update without user intervention
```
(index.js, line 30).

- appStoreUpgrade = (true or false) Whether you want the user to upgrade via the AppStore or Google Play. This makes sense for production versions, where you don't want to risk users upgrading via the app itself.
- appStoreLink = The link that the user should be referred to to upgrade via the AppStore or Google Play.

#Notes
1. Making fundamental changes to the app experience on iOS without going through the iTunes Connect submission process is against the rules of the Apple Developer agreement. I therefore recommend you only use this solution for TestFlight users or extremely critical bug fixes or slight changes that do not affect the actual user experience or main features.
2. To minimize server load, the app server will automatically zip the contents of each branch's folder and caches this to serve the clients. Therefore if you make any changes to the code in a given branch, you have to either give it a newer version number in its 'version.ini' or manually delete the zip file in the root folder of the app server to ensure the clients get the latest code.
