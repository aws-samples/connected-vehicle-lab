#!/usr/bin/python

import ssl
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTShadowClient
import json
import time
import os

#Setup our MQTT client and security certificates
#Make sure your certificate names match what you downloaded from AWS IoT

#Note: We are using the Shadow Client
clientId = "1HGCP2F31BA126165-write"
mqttc = AWSIoTMQTTShadowClient(clientId)

#change into current directory so certificate can read from the path
os.chdir(os.path.dirname(__file__))

#Make sure you use the correct region!
mqttc.configureEndpoint("<random-char>-ats.iot.us-east-1.amazonaws.com",8883)
mqttc.configureCredentials("./rootCA.pem", "./tcu-private.pem.key",  "./tcu-certificate.pem.crt")

shadowClient=mqttc.createShadowHandlerWithName("tcu",True)

shadowMessage = { "state" :
                    {
                        "reported": {
                            "door"      : 'close'
                        }
                    }
                 
                }
shadowMessage = json.dumps(shadowMessage)

#Function to encode a payload into JSON
def json_encode(string):
        return json.dumps(string)

#Function to print message
def on_message(message, response, token):
    print (" response : " + response + " , message : " + message)
    
#Function to print message
def delete_message(message, response, token):
    print (" response : " + response + " , message : " + message)


shadowClient.on_message= on_message
shadowClient.json_encode=json_encode

#sending vechile shadow update
mqttc.connect()
print ("Connected")
#delete the existing desire state from shadow 
shadowClient.shadowDelete(delete_message, 5)
shadowClient.shadowUpdate(shadowMessage,on_message, 5)
print ("Shadow Update Sent")
time.sleep(5)
mqttc.disconnect()
