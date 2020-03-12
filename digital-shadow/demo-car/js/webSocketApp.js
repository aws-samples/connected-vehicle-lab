var CONNECTED = false;
/**
 * utilities to do sigv4
 * @class SigV4Utils
 */
function SigV4Utils() {}

SigV4Utils.getSignatureKey = function(key, date, region, service) {
    var kDate = AWS.util.crypto.hmac('AWS4' + key, date, 'buffer');
    var kRegion = AWS.util.crypto.hmac(kDate, region, 'buffer');
    var kService = AWS.util.crypto.hmac(kRegion, service, 'buffer');
    var kCredentials = AWS.util.crypto.hmac(kService, 'aws4_request', 'buffer');
    return kCredentials;
};

SigV4Utils.getSignedUrl = function(host, region, credentials) {
    var datetime = AWS.util.date.iso8601(new Date()).replace(/[:\-]|\.\d{3}/g, '');
    var date = datetime.substr(0, 8);

    var method = 'GET';
    var protocol = 'wss';
    var uri = '/mqtt';
    var service = 'iotdevicegateway';
    var algorithm = 'AWS4-HMAC-SHA256';

    var credentialScope = date + '/' + region + '/' + service + '/' + 'aws4_request';
    var canonicalQuerystring = 'X-Amz-Algorithm=' + algorithm;
    canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(credentials.accessKeyId + '/' + credentialScope);
    canonicalQuerystring += '&X-Amz-Date=' + datetime;
    canonicalQuerystring += '&X-Amz-SignedHeaders=host';

    var canonicalHeaders = 'host:' + host + '\n';
    var payloadHash = AWS.util.crypto.sha256('', 'hex')
    var canonicalRequest = method + '\n' + uri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;

    var stringToSign = algorithm + '\n' + datetime + '\n' + credentialScope + '\n' + AWS.util.crypto.sha256(canonicalRequest, 'hex');
    var signingKey = SigV4Utils.getSignatureKey(credentials.secretAccessKey, date, region, service);
    var signature = AWS.util.crypto.hmac(signingKey, stringToSign, 'hex');

    canonicalQuerystring += '&X-Amz-Signature=' + signature;
    if (credentials.sessionToken) {
        canonicalQuerystring += '&X-Amz-Security-Token=' + encodeURIComponent(credentials.sessionToken);
    }

    var requestUrl = protocol + '://' + host + uri + '?' + canonicalQuerystring;
    console.log(requestUrl);
    return requestUrl;
};


var connectOptions = {

    onSuccess: function() {
        console.log("onSuccess called")
        onConnect();
    },
    useSSL: true,
    timeout: 3,
    mqttVersion: 4,

    onFailure: function() {
        console.log("onFailure called")
    }
};

var client;

function connectDeviceTwoWay(credentials) {
    //get the url
    requestUrl = SigV4Utils.getSignedUrl(appVariables.IOT_ENDPOINT, appVariables.REGION, credentials)
    clientId = "1HGCP2F31BA126165-WebTwoWay"

    // Create a client instance
    client = new Paho.MQTT.Client(requestUrl, clientId);

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect the client
    client.connect(connectOptions);
}

// called when the client connects
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    CONNECTED = true;
    client.subscribe("$aws/things/tcu/shadow/update/accepted");
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    CONNECTED = false;
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}

// called when a message arrives
function onMessageArrived(message) {
    CONNECTED = true;
    console.log("onMessageArrived:" + message.payloadString);
    payload = JSON.parse(message.payloadString);
    payloadData = (payload.state.reported || payload.state.desired) == undefined ? payload.state : (payload.state.reported == undefined ? payload.state.desired : payload.state.reported)
        //console.log(payloadData);
    if (payloadData.window != undefined) handleWindowCommand(payloadData.window);
    if (payloadData.door != undefined) handleDoorCommand(payloadData.door);
    if (payloadData.headlight != undefined) handleHeadlightCommand(payloadData.headlight);
    if (payloadData.trunk != undefined) handleDoorCommand(payloadData.trunk);

}

//this function will get called when user will click on window checkbox
function handleWindowCommand(windowStatus) {
    obj = document.getElementsByClassName("action window")[0];
    obj.checked = windowStatus == "down" ? true : false;
    console.log(obj.getAttribute("data-text") + " : " + obj.checked);
}

//this function will get called when user will click on door checkbox
function handleDoorCommand(doorStatus) {
    obj = document.getElementsByClassName("action door")[0];
    obj.checked = doorStatus == "open" ? true : false;
    console.log(obj.getAttribute("data-text") + " : " + obj.checked);
}

//this function will get called when user will click on trunk checkbox
function handleTrunkCommand(trunkStatus) {
    obj = document.getElementsByClassName("action trunk")[0];
    obj.checked = trunkStatus == "open" ? true : false;
    console.log(obj.getAttribute("data-text") + " : " + obj.checked);
}

//this function will get called when user will click on Headlight checkbox
function handleHeadlightCommand(headlightStatus) {
    obj = document.getElementsByClassName("action headlight")[0];
    obj.checked = headlightStatus == "on" ? true : false;
    console.log(obj.getAttribute("data-text") + " : " + obj.checked);
}