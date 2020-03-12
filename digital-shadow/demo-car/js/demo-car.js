var demoCar = {

    shadowMessage: {
        "state": {
            "reported": {
                "firmware": 'v1.01234'
            },

            "desired": {}
        }
    },

    // Create a client id to use when connecting to AWS IoT.
    _clientId: '1HGCP2F31BA126165-Web',

    // Create the AWS IoT device object.  Note that the credentials must be 
    // initialized with empty strings; when we successfully authenticate to
    // the Cognito Identity Pool, the credentials will be dynamically updated.
    webClient: new AWS.IotData({
        // Set the AWS region we will operate in.
        region: appVariables.REGION,
        ////Set the AWS IoT Host Endpoint
        endpoint: appVariables.IOT_ENDPOINT,
        // Use the clientId created earlier.
        clientId: this._clientId,
        // Connect via secure WebSocket
        protocol: 'wss',
        // Set the maximum reconnect time to 8 seconds; this is a browser application
        // so we don't want to leave the user waiting too long for reconnection after
        // re-connecting to the network/re-opening their laptop/etc...
        maximumReconnectTimeMs: 8000,
        // Enable console debugging information (optional)
        debug: true,
        // IMPORTANT: the AWS access key ID, secret key, and sesion token must be 
        // initialized with empty strings.
        accessKeyId: '',
        secretKey: '',
        sessionToken: ''
    }),

    //this function will get called when user will click on door checkbox
    handleDoorCommand: function(obj) {
        obj.checked ? demoCar.shadowMessage.state.desired.door = "open" : demoCar.shadowMessage.state.desired.door = "close";
        console.log(obj.getAttribute("data-text") + " : " + demoCar.shadowMessage.state.desired.door);
        demoCar.accessIoTDevice();
    },

    //this function will get called when user will click on window checkbox
    handleWindowCommand: function(obj) {
        obj.checked ? demoCar.shadowMessage.state.desired.window = "down" : demoCar.shadowMessage.state.desired.window = "up";
        console.log(obj.getAttribute("data-text") + " : " + demoCar.shadowMessage.state.desired.window);
        demoCar.accessIoTDevice();
    },

    //this function will get called when user will click on headlight checkbox
    handleHeadLightCommand: function(obj) {
        obj.checked ? demoCar.shadowMessage.state.desired.headlight = "on" : demoCar.shadowMessage.state.desired.headlight = "off";
        console.log(obj.getAttribute("data-text") + " : " + demoCar.shadowMessage.state.desired.headlight);
        demoCar.accessIoTDevice();
    },

    //this function will get called when user will click on door checkbox
    handleTrunkCommand: function(obj) {
        obj.checked ? demoCar.shadowMessage.state.desired.trunk = "open" : demoCar.shadowMessage.state.desired.trunk = "close";
        console.log(obj.getAttribute("data-text") + " : " + demoCar.shadowMessage.state.desired.trunk);
        demoCar.accessIoTDevice();
    },

    // Called to use UnAuth role to access IoT service
    accessIoTDevice: function() {

        //Create Identity credentials
        AWS.config.region = appVariables.REGION;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: appVariables.IDENTITY_POOL_ID });

        // Obtain AWS credentials
        AWS.config.credentials.get(function() {
            //Connect the IoT using temporary credentials
            demoCar.webClient.config.credentials = AWS.config.credentials;
            demoCar.connectDevice();

            //Connect for two way if its not connected.
            if (!CONNECTED) {
                connectDeviceTwoWay(AWS.config.credentials);
            }
        });
    },

    connectDevice: function() {

        var params = {
            payload: JSON.stringify(demoCar.shadowMessage) /* Strings will be Base-64 encoded on your behalf */ ,
            /* required */
            thingName: 'tcu' /* required */
        };
        demoCar.webClient.updateThingShadow(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);
            // successful response
            //reset the local shadow state
            demoCar.shadowMessage.state.desired = {}
        });

    },
}