/*
 * Developed by Roger Carvalho for RDC Media Ltd.
 * This file is part of CordovaUniversalAppServer.
 *
 * CordovaUniversalAppServer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CordovaUniversalAppServer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * See the GNU General Public License at <http://www.gnu.org/licenses/>.
 */

/*******************************************************/
/*
 * Configuration, update the variables below to match
 * your desired setup
 */
/*******************************************************/

var remoteServer = "http://www.snoovies.com/cordovauniversalappserver/";
//The server that is hosting the universal appserver api. Ensure it is the root directory of any hosted releases and that it ends with a '/'
var clientType = "beta";
//The type of updates this app will download. Default options are dev, alpha, beta and production. 
//You can add any additional types to support A/B testing or user group specific versions
window.allowAutoUpdate = true;
//Whether this app will support auto update. If enabled, the server can initiate an app update without user intervention

/********************************************************/

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        
        //Check or setup a global variable for the bundle status
		//This lets the app know whether a valid bundle has been downloaded previously
        var bundlestatus = localStorage.getItem('validBundle')
        if (bundlestatus == "yes")
        {
            window.hasValidBundle = true;
        }
        else
        {
            window.hasValidBundle = false;
        }
        
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function()
    {
        app.receivedEvent('deviceready');
		
		//Check the device platform, this helps the app determine which bundle it needs to download from the server        
        if (device.platform == "iOS")
        {
            window.platform = "ios"
        }
        else if (device.platform == "Android")
        {
            window.platform = "android";
        }

		//For debugging, whenever an error is reported, show it in the console of the IDE.
        window.onerror = function(message, url, lineNumber) {
            console.log("Error: "+message+" in "+url+" at line "+lineNumber);
        }
        
		//Setup where downloaded bundles need to be stored.
        store = cordova.file.dataDirectory;
		
		//Determine which bundle the app should run
        if (window.hasValidBundle)
        {
            //Get version from local storage
            window.version = localStorage.getItem('bundleVersion');
            
        }
        else
        {
            //The app was opened for the first time or had an error when trying to update the bundle. Revert to local bundle
            window.version = AppVersion.version;
        }
        
        console.log("the currently installed bundle version is " + window.version);
        
		//Create a fileManager object. 
		//This object connects to the App Server indicated above and checks if there is a newer bundle for this client type available.
        var fileManagerArgs =
        {
            remoteServer: remoteServer,
            clientInfo: clientType,
            clientOs: window.platform
        }
        var fileManager = new FileManager(fileManagerArgs);

        //Update the UI to inform users that the app is busy
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        
		//Process the bundle that the App Server has provided. This could mean downloading and installing a new bundle, or simply load the previously installed bundle
        fileManager.processBundle();
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    

        console.log('Received Event: ' + id);
    }
};

app.initialize();