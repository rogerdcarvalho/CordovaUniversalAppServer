var FileManager = function (params)
/*
 FileManager object, manages local and remote files to be used by self app
 */
{
    var self = this;
    
    self.unzipBundle = function(zipFile, version)
    {
        console.log('Unzip bundle called');
        var destination = cordova.file.dataDirectory;
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
FileManager.prototype.displayLocalBundle = function()
{
    var url = cordova.file.applicationDirectory + "www/bundle/index.html";
    location.replace(url);
    
}

FileManager.prototype.installLocalBundle = function()
{
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
FileManager.prototype.compareBundledVersion = function()
{
    console.log('compareBundledVersion called');
    var self = this;
    var data =
    {
    clientid: self.clientInfo,
    clientos: self.clientOs,
    version: AppVersion.version,
    apirequest: "currentversion"
    }
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
    var serverRequestArgs =
    {
    data: data,
    server: self.remoteServer,
    callBack: callBack
    }
    
    //compare bundled version
    var version = new ServerRequest(serverRequestArgs);
    
}
FileManager.prototype.processBundle = function(params)
/*
 Method to download bundle
 */
{
    var self = this;
    var data =
    {
    clientid: self.clientInfo,
    clientos: self.clientOs,
    apirequest: "upgradeadvice",
    version: window.version
        
    }
    
    callBack = function(serverRequest)
    {
        console.log('Server request callback called');
        
        if (serverRequest.succeeded)
            //The bundle info was successfully provided
        {
            console.log('Server request succeeded');
            
            var path = "/";
            var json = serverRequest.response;
            //console.log(json);
            if (isValidJson(json))
            {
                var bundleInfo = JSON.parse(json);
                var installedVersion = bundleInfo["installedVersion"];
                
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
                {
                    console.log('the server has advised an upgrade');
                    
                    var file = bundleInfo["file"];
                    var forceUpgrade = bundleInfo["forceUpgrade"];
                    var appStoreUpgrade = bundleInfo["appStoreUpgrade"];
                    var appStoreLink = bundleInfo["appStoreLink"];
                    var upgradeTitle = bundleInfo["upgradeTitle"];
                    var upgradeMessage = bundleInfo["upgradeMessage"];
                    var bundleVersion = bundleInfo["availableVersion"];
                    
                    
                    var fileDownloaderArgs =
                    {
                    remotePath: path,
                    fileName: file,
                    localStore: cordova.file.dataDirectory,
                    version: bundleVersion,
                    callBack: self.unzipBundle
                    }
                    
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
                    {
                        console.log('The user should decide on whether to upgrade');
                        
                        // process the confirmation dialog result
                        function onConfirm(buttonIndex) {
                            
                            if (buttonIndex == 1)
                            {
                                if (appStoreUpgrade)
                                {
                                    upgradeViaAppStore(appStoreLink);
                                    
                                    //setTimeout(function()
                                   // {
                                        if (!window.hasValidBundle && !window.installing)
                                        {
                                            self.displayLocalBundle();
                                        }
                                        else
                                        {
                                            var url = cordova.file.dataDirectory + "index.html";
                                            location.replace(url);
                                        }
                                   // },2500);

                                    


                                    
                                }
                                else
                                {
                                    localStorage.setItem('validBundle', "no");
                                    self.downloadAsset(fileDownloaderArgs);
                                }
                            }
                            else
                            {
                                console.log('The user did not want to upgrade');
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
                        
                        showConfirm(upgradeTitle, upgradeMessage, onConfirm);
                        
                    }
                    
                }
                
                
            }
            else
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
            //The bundle info was not provided
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

FileManager.prototype.downloadAsset = function(params)
/*
 Method to download assets
 */
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
