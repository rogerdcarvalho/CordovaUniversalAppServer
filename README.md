# CordovaUniversalAppServer
A Cordova/PhoneGap environment which allows you to update Android and iOS apps on-the-fly and allows A-B testing of User Interfaces/Features.

#Summary
This solution allows Cordova/PhoneGap developers to update their mobile apps on-the-fly, without needing to go through Google Play/Apple AppStore. It also allows A-B testing of features and/or User Experiences, as the same app bundle can display different hosted versions of the app, depending on how it identifies itself to the App Server.

#How it works
This solution consists of 2 elements.

1. A php-based server solution, which serves different versions of the apps to mobile clients
2. A Cordova/Phonegap based client solution, which connects to the server to load whatever code is hosted. 

Whenever a user opens the app, the app connects to the server to find out what code it should load. The app identifies itself and its current version to the server, and the server then checks if there is a newer version of the code available. If this is the case, the app replaces its own code with that which was offered by the server. If the app is offline, it will just load whatever code was bundled with it. If anything goes wrong while trying to download a newer version, it also gracefully reverts to the bundled code. You can decide if the app should just update code automatically without informing the user, or whether the user should be asked if they want to upgrade. You can also use the app server to simply redirect the user to the appstore/google play and upgrade from there.

The actual code of the app is stored in the 'www/bundle' directory of the client app, the rest of the contents of the'www' folder are used to interact with the app server. The app will thus load index.html within 'www/bundle' if the app is offline or if there is no newer version available on the server. On the server, you host different versions of the contents of 'www/bundle'. You can host however many branches you'd like. Then in every client you release, you add how the client should identify itself to the server and the server then decides which branch it provides. The most important files to read through to understand the way this all works are 'index.php' in the server directory and 'www/js/index.js' and 'www/js/filemanager.js/' in the client directory. Also look at 'version.ini' in each of the branch subdirectories of the server to see how the server handles versioning of bundles.

#How to use
1. Simply upload the contents of the server folder to your own server. The contents of the server folder are for 4 template forks of a sample Cordova/PhoneGap app, being 'alpha', 'beta', 'dev' and 'production'. In your implementation you can have as many forks as you'd like, that can serve AB-Testing or whichever form of product differentiation suits your proposition. You can edit index.php to accommodate this. 
2. Next, open client/www/js/index.js and enter the domain/ip address of your server (and the folder in which you placed the server directory contents) on line 27. Then build the app and run it on either Android or iOS. You will see that the app automatically integrates and runs the code that is hosted on your server under the 'beta' folder. You can change which folder it looks at by changing line 29 in index.js.
3. To host your own app instead of the sample code, simply build your solution with phonegap, and copy the contents of 'platforms/ios/www' or 'platforms/android/www' to the 'www/bundle' directory of the client and server directories 'alpha', 'beta', 'dev' or 'production'. Add a version.ini file to each of those directories, check the template apps for what this ini file needs to contain. 

#Notes
1. Making fundamental changes to the app experience on iOS without going through the iTunes Connect submission process is against the rules of the Apple Developer agreement. I therefore recommend you only use this solution for critical bug fixes or slight changes.
2. To minimize server load, the app server will automatically zip the contents of each branch's folder and caches this to serve the clients. Therefore if you make any changes to the code in a given branch, you have to either give it a newer version number in its 'version.ini' or manually delete the zip file in the root folder of the app server to ensure the clients get the latest code.
