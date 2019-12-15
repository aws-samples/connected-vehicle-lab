#!/usr/bin/python

import sys
import ssl
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTShadowClient
import json
import time
import os

# Setup our MQTT client and security certificates# Make sure your certificate names match what you downloaded from AWS IoT

# Note: We are using the Shadow Client
clientId = "1HGCP2F31BA126165-read"
mqttc = AWSIoTMQTTShadowClient(clientId)

dirPath = str(os.getcwd())

# Make sure you use the correct region!
mqttc.configureEndpoint("data.iot.us-east-1.amazonaws.com", 8883)
mqttc.configureCredentials(dirPath + "/tcu/rootCA.pem", dirPath + "/tcu/tcu.private.key",  dirPath + "/tcu/tcu.cert.pem")


shadowClient = mqttc.createShadowHandlerWithName("tcu", True)

# Function to encode a payload into JSON
def json_encode(string):
  return json.dumps(string)

mqttc.json_encode = json_encode
shadowClient.json_encode = json_encode


def on_message(message, response, token):
    print ("Received Delta :  " + message)
    data = json.loads(message)
    currentState = data.get('state')
    
    #reportedShadowMessage = {"state":{"reported":{}}}
    shadowClient.reportedShadowMessage = {"state":{"reported":{}}}

    #handle each command
    headlight_handle(currentState.get('headlight'))
    window_handle(currentState.get('window'))
    door_handle(currentState.get('door'))
    msg = json.dumps(shadowClient.reportedShadowMessage)
    #print msg
    #Update the reported status to device shadow   
    shadowClient.shadowUpdate(msg,on_reported, 5)
  
    
def on_reported(message, response, token):
    print ("Reported state : " + response)

def headlight_handle(status):
  if status is not None:
    shadowClient.reportedShadowMessage['state']['reported']['headlight'] = status
    print ('Perform action on headlight status change : ' + str(status))

def window_handle(status):
  if status is not None:
    shadowClient.reportedShadowMessage['state']['reported']['window'] = status
    print ('Perform action on window status change : ' + str(status))

def door_handle(status):
  if status is not None:
    shadowClient.reportedShadowMessage['state']['reported']['door'] = status
    print ('Perform action on door status change : ' + str(status))

mqttc.on_message = on_message
shadowClient.on_message = on_message

mqttc.connect()
print ("Connected")
shadowClient.shadowRegisterDeltaCallback(on_message)
print ("Listening for Delta Messages")

# Loop forever
while True:
  pass