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

var FileManager = function (params)
/*
 FileManager object, manages local and remote files to be used by the client
 */
{
    //use a 'self' variable to manage functions and variables.
	var self = this;
    
	//Unzip function: allows the client to unzip a zip downloaded from the server for use.
    self.unzipBundle = function(zipFile, version)
    {
        console.log('Unzip bundle called');
		
		//Set destination
        var destination = cordova.file.dataDirectory;
        
		//Set the onCompletion function.
		//When the bundle has been unzipped, update the local configuration information and load its cordova index.html
		var onCompletion = function()
        {
            console.log('OnCompletion of unzip called');
            
            localStorage.setItem('bundleVersion', version);
            localStorage.setItem('validBundle', "yes");
            window.installing = false;

            console.log('Bundle installed: version' + version);
            
            var url = cordova.file.dataDirectory + "index.html";
            location.replace(url);
            
        };
		
		//Unzip the bundle
        console.log('Unzipping ' + zipFile.nativeURL );
        zip.unzip(zipFile.nativeURL, destination, onCompletion);
        
    }
    
    //Apply provided params as properties
    if (typeof params.remoteServer != 'undefined')
    {
        self.remoteServer = params.remoteServer;
    }
    
    if (typeof params.clientInfo != 'undefined')
    {
        self.clientInfo = params.clientInfo;
    }
    
    if (typeof params.clientOs != 'undefined')
    {
        self.clientOs = params.clientOs;
    }
    
    console.log('Created a FileManager object for ' + self.clientInfo + ' with ' + self.remoteServer + ' and Operating System: ' + self.clientOs);

};

//Display function: Displays a previously downloaded bundle as main content of the app
FileManager.prototype.displayLocalBundle = function()
{
    var url = cordova.file.applicationDirectory + "www/bundle/index.html";
    location.replace(url);
    
}

//Install function: Installs a downloaded bundle to the local file system
FileManager.prototype.installLocalBundle = function()
{
    //use a 'self' variable to manage functions and variables.
	var self = this;
	
    console.log('installing local bundle');
    window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + "www/bundle/bundle.zip", gotFile, fail);
    function gotFile(fileEntry) {
        alert("gotfile ran");
        self.unzipBundle(fileEntry, AppVersion.version);
        window.installing = true;
        
    }
    function fail(e) {
        console.log('FileSystem Error');
        localStorage.setItem('validBundle', "no");
        console.dir(e);
    }
};

//Compare function: Asks the server for the latest version and compares this with the current local version
FileManager.prototype.compareBundledVersion = function()
{
    console.log('compareBundledVersion called');
	
	//use a 'self' variable to manage functions and variables.
    var self = this;
	
	//Prepare data to send to server
    var data =
    {
    clientid: self.clientInfo,
    clientos: self.clientOs,
    version: AppVersion.version,
    apirequest: "currentversion"
    }
	
	//Debug: Inform the console what version is loaded and available
    callBack = function(serverRequest)
    {
        console.log('compareBundledVersion callback called');
        if (serverRequest.succeeded)
        {
            var currentVersion = serverRequest.response;
            var bundledVersion = AppVersion.version;
            console.log("The current version is " + currentVersion + " and the bundled version is " + bundledVersion);
        }
    }
	
	//Add all information into a variable to share with the server
    var serverRequestArgs =
    {
    data: data,
    server: self.remoteServer,
    callBack: callBack
    }
    
    //compare bundled version
    var version = new ServerRequest(serverRequestArgs);
    
}

//Process function: Follows the instructions set in index.js. It asks the server if a new version is available and if so, follows the instructions given (either upgrade automatically or ask the user to upgrade - through AppStore/Google Play or direct).
FileManager.prototype.processBundle = function(params)
{
	//use a 'self' variable to manage functions and variables.
    var self = this;
	
	//Prepare data to send to the server
    var data =
    {
    clientid: self.clientInfo,
    clientos: self.clientOs,
    apirequest: "upgradeadvice",
    version: window.version
        
    }
    
	//Prepare callback function
    callBack = function(serverRequest)
    {
        console.log('Server request callback called');
        
        if (serverRequest.succeeded)
        //The bundle info was successfully provided
        {
            console.log('Server request succeeded');
            
            var path = "/";
            var json = serverRequest.response;
            console.log('The json provided by the server is ' + json);
            
			//If the json provided is valid, take action as required
			if (isValidJson(json))
            {
				//Find out whether the installed version has an upgrade available
                var bundleInfo = JSON.parse(json);
                var installedVersion = bundleInfo["installedVersion"];
                
				//The installed version is the latest, simply load local bundle
                if (installedVersion == "latest")
                {
                    console.log('the version that is currently installed is the latest version');
                    if (!window.hasValidBundle && !window.installing)
                    {
                        self.displayLocalBundle();
                    }
                    else
                    {
                        var url = cordova.file.dataDirectory + "index.html";
                        location.replace(url);
                    }
                }
				
                else
				//The installed version is outdated. Decide how to offer an upgrade
                {
                    console.log('the server has advised an upgrade');
                    
					//Get all information provided by the server
                    var file = bundleInfo["file"];
                    var forceUpgrade = bundleInfo["forceUpgrade"];
                    var appStoreUpgrade = bundleInfo["appStoreUpgrade"];
                    var appStoreLink = bundleInfo["appStoreLink"];
                    var upgradeTitle = bundleInfo["upgradeTitle"];
                    var upgradeMessage = bundleInfo["upgradeMessage"];
                    var bundleVersion = bundleInfo["availableVersion"];
                    
                    //Set the arguments for the file downloader to get the newer bundle
                    var fileDownloaderArgs =
                    {
                    remotePath: path,
                    fileName: file,
                    localStore: cordova.file.dataDirectory,
                    version: bundleVersion,
                    callBack: self.unzipBundle
                    }
                    
					//If index.js allows automatic update, simply process the update
                    if (forceUpgrade && window.allowAutoUpdate)
                    {
                        if (appStoreUpgrade)
                        {
                            upgradeViaAppStore(appStoreLink);
                            
                        }
                        else
                        {
                            console.log('The server indicated that the upgrade should occur without user intervention');
                            localStorage.setItem('validBundle', "no");
                            self.downloadAsset(fileDownloaderArgs);
                        }
                    }
                    else
					//Index.js required the user to approve upgrades
                    {
                        console.log('The user should decide on whether to upgrade');
                        
                        // process the confirmation dialog result
                        function onConfirm(buttonIndex) {
                            
                            if (buttonIndex == 1)
							//The user wants to upgrade. Either forward to appstore or upgrade internally
                            {
                                if (appStoreUpgrade)
								//The server advised upgrading should occur via AppStore/Google Play
                                {
									//Forward the user to the appstore
                                    upgradeViaAppStore(appStoreLink);
                                    
										//Load either the default (shipped) bundle or one previously downloaded
                                        if (!window.hasValidBundle && !window.installing)
                                        {
                                            self.displayLocalBundle();
                                        }
                                        else
                                        {
                                            var url = cordova.file.dataDirectory + "index.html";
                                            location.replace(url);
                                        }
                   
                                }
                                else
								//The server advised internal upgrade
                                {
                                    localStorage.setItem('validBundle', "no");
                                    self.downloadAsset(fileDownloaderArgs);
                                }
                            }
                            else
							//The user did not want to upgrade
                            {
                                console.log('The user did not want to upgrade');
								
								//Load either the default (shipped) bundle or one previously downloaded
                                if (!window.hasValidBundle && !window.installing)
                                {
                                    self.displayLocalBundle();
                                }
                                else
                                {
                                    var url = cordova.file.dataDirectory + "index.html";
                                    location.replace(url);
                                }
                                
                            }
                            
                        }
						
                        //Ask the user what they want to do
                        showConfirm(upgradeTitle, upgradeMessage, onConfirm);
                        
                    }
                    
                }
                
                
            }
            else
			//An error has occurred while trying to request bundle information from the server
            {
                console.log('The server did not provide valid bundle info. Check configuration');
                if (!window.hasValidBundle && !window.installing)
                {
                    self.displayLocalBundle();
                }
                else
                {
                    var url = cordova.file.dataDirectory + "index.html";
                    location.replace(url);
                }
                
            }
            
        }
        
        else
        //The json was invalid
        {
            console.log('The server did not provide bundle info. Check configuration');
            if (!window.hasValidBundle && !window.installing)
            {
                self.displayLocalBundle();
            }
            else
            {
                var url = cordova.file.dataDirectory + "index.html";
                location.replace(url);
            }
            
        }
    };
    
    var serverRequestArgs =
    {
    data: data,
    server: self.remoteServer,
    callBack: callBack
    }
    
    //download bundleinfo
    var download = new ServerRequest(serverRequestArgs);
    
};

//Download function: Downloads a bundle from the server
FileManager.prototype.downloadAsset = function(params)
{
    var self = this;
    var remoteServer = self.remoteServer;
    var fileName;
    var localStore;
    var localPath;
    var remotePath;
    var validVars = true;
    
    //Process provided params
    if (typeof params.remotePath != 'undefined')
    {
        remotePath = params.remotePath;
    }
    else
    {
        validVars = false;
        console.log('No remotePath provided');
        
    }
    
    if (typeof params.fileName != 'undefined')
    {
        fileName = params.fileName;
        
    }
    else
    {
        validVars = false;
        console.log('No fileName provided');
        
    }
    
    if (typeof params.localStore != 'undefined')
    {
        localStore = params.localStore;
        
    }
    else
    {
        validVars = false;
        console.log('No localStore provided');
        
    }
    if (typeof params.callBack != 'undefined')
    {
        callBack = params.callBack;
    }
    else
    {
        validVars = false;
        console.log('No callback provided');
    }
    if (typeof params.version != 'undefined')
    {
        version = params.version;
    }
    else
    {
        version = 0;
    }
    
    console.log('Starting download of ' + fileName);
    
    
    //If all required params were provided, start download
    if (validVars)
    {
        console.log('Valid arguments provided. Now trying download');
        
        localPath = localStore + remotePath
        var fileTransfer = new FileTransfer();
        console.log('Starting download for ' + remoteServer + remotePath + fileName + ' to ' + localStore);
        console.log(encodeURI(self.remoteServer + remotePath + fileName, localPath + fileName));
        fileTransfer.download
        (
            self.remoteServer + remotePath + fileName, localPath + fileName,
            function(entry)
            {
                console.log('Successfully downloaded ' + fileName + ' to ' + localPath);
                callBack(entry, version);
                window.installing = true;

         
            },
            function(err)
            {
                console.log('Error in file transfer');
                console.dir(err);
                if (!window.hasValidBundle && !window.installing)
                {
                    self.displayLocalBundle();
                }
                else
                {
                    var url = cordova.file.dataDirectory + "index.html";
                    location.replace(url);
                }
            }
         );
    }
    
};
