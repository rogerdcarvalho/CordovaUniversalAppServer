var ServerRequest = function (params)
/*
ServerRequest object, manages api calls to remote servers and stores response data
*/
{
    var self = this;

    //Apply provided params as properties
    if (typeof params.data != 'undefined')
    {
        self.data = params.data;
    }
    
    if (typeof params.server != 'undefined')
    {
        self.server = params.server;

    }
    
    if (typeof params.callBack != 'undefined')
    {
        self.callBack = params.callBack;

    }
    
    if (self.data && self.server && self.callBack)
    {
        
        var request = new XMLHttpRequest();

        // create pairs index=value with data that must be sent to server
        var the_data="";
        
        dataKeys = Object.keys(this.data);
        
        var arrayLength = dataKeys.length;
        for (var i = 0; i < arrayLength; i++)
        {
            var key = dataKeys[i];
            var dataValue = this.data[key];
            the_data += key + "=" + dataValue;
            
            if (i != (arrayLength - 1))
            {
                the_data += "&";
            }
        }
        console.log('Data sent to server is: ' + the_data);
        
        request.open("POST", self.server, true);			// set the request
        
        // adds  a header to tell the PHP script to recognize the data as is sent via POST
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.send(the_data);		// calls the send() method with datas as parameter
        
        // Check request status
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                
                if(request.responseText) {
                    //the server responded successfully
                    self.response =  request.responseText;
                    self.succeeded = true;
                    self.callBack(self);
                }
                
                else
                 //The server did not respond
                {
                    self.callBack(self);
                    self.succeeded = false;

                }
                
            }
            if(request.status !=200)
            {
                //the server was not reached
                self.callBack(self);
                self.succeeded = false;

            }
        }
    }
    
    else
    {
        console.log('ServerRequest failed. Wrong arguments provided');
        this.succeeded = false;
    }
}
function isValidJson(str)
{
    try
    {
        JSON.parse(str);
    }
    catch (e)
    {
        console.log("Not valid JSON: " + e.message);
        return false;
    }
    return true;
}
