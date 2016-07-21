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


