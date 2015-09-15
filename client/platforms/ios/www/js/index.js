/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Configuration, update the variables below to match
 * your desired setup
 */

/*******************************************************/

var remoteServer = "http://www.yourserver.com";
//The server that is hosting the universal appserver api. Ensure it is the root directory of any hosted releases and that it ends with a '/'
var clientType = "beta";
//The type of updates this app will download. Default options are dev, alpha, beta and production
window.allowAutoUpdate = true;
//Whether this app will support auto update. If enabled, the server can initiate an app update without user intervention

/********************************************************/

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        
        //Setup global variable for the bundle status
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
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function()
    {
        app.receivedEvent('deviceready');
        console.log('Javascript OK');
        
        if (device.platform == "iOS")
        {
            window.platform = "ios"
        }
        else if (device.platform == "Android")
        {
            window.platform = "android";
        }
        alert(window.platform);

        window.onerror = function(message, url, lineNumber) {
            console.log("Error: "+message+" in "+url+" at line "+lineNumber);
        }
        
        store = cordova.file.dataDirectory;
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
        
        var fileManagerArgs =
        {
            remoteServer: remoteServer,
            clientInfo: clientType,
            clientOs: window.platform
        }
        var fileManager = new FileManager(fileManagerArgs);

      //  var bundleDownloaderArgs =
        //{
          //  localStore: store
        //}
        
        //Update the UI to inform users that the app is busy
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        
        fileManager.processBundle();
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    

        console.log('Received Event: ' + id);
    }
};

app.initialize();