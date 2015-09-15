<?php
/*
This is the server API file. Put this in the root folder of all your hosted releases.
Within this folder, you have to have folders that are named according to what the client will send as data
(default: ios and android as first level and dev, alpha, beta and production as second level). 
Ensure you install this file on a PHP compatible server, in a directory that has read and write access (CHMOD 777).
Whenever a client sends an api request, this file will check its subdirectories to provide whatever the client requires.
You need to host the different versions as normal directories (the www belonging to the specific platform, which includes
the cordova and plugin js files), this file will zip and name them in the way that the client
is expecting to install them.
*/
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Accept, Origin, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

//Check if the server is being approached with the expected POST variable
if (isset($_POST['apirequest']))
{
	//Get branch, version and Operating System from app, and find out what the app is requesting
   	$clientid = $_POST['clientid'];
	$clientos = $_POST['clientos'];
   	$routine = $_POST['apirequest'];
	$version = $_POST['version'];
	
	if ($clientid && $clientos && $routine && $version)
	//All required variables are provided, now prepare to serve the client
	{
		//Look for version.ini in the subfolder that hosts the latest release for this specific client
		$ini_array = parse_ini_file($clientos."/".$clientid."/version.ini");
		
		//Store the information provided in version.ini
		$currentVersion = $ini_array["version"];
		$forceUpgrade = $ini_array["forceUpgrade"];
		$appStoreUpgrade = $ini_array["appStoreUpgrade"];
		$appStoreLink = $ini_array["appStoreLink"];
		$upgradeTitle = $ini_array["upgradeTitle"];
		$upgradeMessage = $ini_array["upgradeMessage"];
	}
	
	switch ($routine) 
	{
    	case "checkversion":
		//The app simply wants to know if it is running the latest version. Provide this information
			
			if (version_compare($currentVersion,  $version) > 0)
			//The version indicated in version.ini in the subfolder is higher than the version provided by the app
			{
				echo "upgrade";
			}
			else
			//The version provided by the app is the same or higher than the one indicated by version.ini in the matching subfolder
			{
				echo "latest";
			}
        break;
		
    	case "filelist":
		//The app wants a list of all the files available in the latest version. This can be used to support partial updates in the future
		
			//Setup a recursiveIterator for the directory hosting the latest version applicable to the client
			$directory = $clientos."/".$clientid;
			$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));
			$it->rewind();
			$files=array();
			
			//Go through all directory entries
			while($it->valid()) 
			{
				//If the element is an actual file
 				if (!$it->isDot()) 
				{
					//Add the information to an array
      				$path_parts = pathinfo($it->getSubPathName());
					$path = $clientos."/".$path_parts['dirname'];
					$file = $path_parts['basename'];
	  				$files[]=array("path" => $path, "file" => $file);  
    			}

				$it->next();
			}
			
			//Provide the array as JSON to the client
			echo json_encode($files);
			
        break;
		
		case "upgradeadvice":
		//The app wants advice on whether to upgrade or not and in what way
		
			if (version_compare($currentVersion,  $version) > 0)
			//The version indicated in version.ini in the subfolder is higher than the version provided by the app
			{
				//Find out whether the hosted version is already available zipped in the root foldor
				$zipfile = $clientos.$clientid.$currentVersion.".zip";

				if (file_exists($zipfile))
				{
					//The file has already been zipped. Provide the reference data that was stored from version.ini 
					$response = array
							(
								"installedVersion" => "old",
								"file" => $zipfile, 
								"forceUpgrade" => $forceUpgrade,
								"appStoreUpgrade" => $appStoreUpgrade,
								"upgradeTitle" => $upgradeTitle,
								"upgradeMessage" => $upgradeMessage,
								"appStoreLink" => $appStoreLink,
								"availableVersion" => $currentVersion								
							);
					echo json_encode($response);  			
				}
				else
				{
					// Get real path for the directory
					$rootPath = realpath($clientos."/".$clientid);

					// Initialize archive object
					$zip = new ZipArchive();
					$zip->open($zipfile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

					// Create recursive directory iterator
					$files = new RecursiveIteratorIterator
					(
    					new RecursiveDirectoryIterator($rootPath),
    					RecursiveIteratorIterator::LEAVES_ONLY
					);

					foreach ($files as $name => $file)
					{
    					// Skip directories (they would be added automatically)
	    				if (!$file->isDir())
    					{
        					// Get real and relative path for current file
	        				$filePath = $file->getRealPath();
	    	    			$relativePath = substr($filePath, strlen($rootPath) + 1);

    	    				// Add current file to archive
	    	    			$zip->addFile($filePath, $relativePath);
    					}
					}

					// Zip archive will be created only after closing object
					$zip->close();
				
					//Provide reference information
					$response = array
							(
								"installedVersion" => "old",
								"file" => $zipfile, 
								"forceUpgrade" => $forceUpgrade,
								"appStoreUpgrade" => $appStoreUpgrade,
								"upgradeTitle" => $upgradeTitle,								
								"upgradeMessage" => $upgradeMessage,
								"appStoreLink" => $appStoreLink,
								"availableVersion" => $currentVersion								
							);
					echo json_encode($response);  

				}	
			}
			else
			//The version provided by the app is the same or higher than the one indicated by version.ini in the matching subfolder
			{
				//As the app is expecting a JSON object, return the fact that it is running the latest version as such
				$response = array
							(
								"installedVersion" => "latest"
							);
				echo json_encode($response);  
			}
		
			
		
		break;
    
    	default:
        echo "Unknown API request";
	}
}
else
{
	echo "No API request";
	print_r($_POST);
}
?>