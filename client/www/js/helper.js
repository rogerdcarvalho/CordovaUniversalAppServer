//Open an appstore link
function upgradeViaAppStore(appStoreLink)
{
    console.log("The server indicated the upgrade should be handled by the app store/google play");
    //Update the UI to inform users that the app is upgrading
    var parentElement = document.getElementById('deviceready');
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');
    var completedElement = parentElement.querySelector('.completed');
    
    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:none;');
    completedElement.setAttribute('style', 'display:block;');
    
    //cordova.InAppBrowser.open(appStoreLink);
    window.open(appStoreLink, '_system', 'location=yes');
}

// Show a custom confirmation dialog
function showConfirm(title, message, onConfirm)
{
    navigator.notification.confirm(
                                   message, // message
                                   onConfirm,            // callback to invoke with index of button pressed
                                   title,           // title
                                   ['Yes','No']         // buttonLabels
                                   );
    
    
}


