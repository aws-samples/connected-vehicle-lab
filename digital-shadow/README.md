## Digital Shadow of Connected Vehicle

### Pre-requisite
Login into AWS console and Create a Cloud 9 environment, Default configuration setting is fine.

#### Create Stack using AWS CDK
Open Cloud 9 IDE environment and clone git repository or upload code files from your local directory.

```git clone https://github.com/aws-samples/connected-vehicle-lab/```

You should have below directory under your Cloud9 IDE root folder
connected-vehicle-la/digital-shadow
 - connected-vehicle-app-cdk  
 - demo-car 
 - tcu

Open Cloud 9 IDE environment terminal window and install AWS CDK. More information @ https://aws.amazon.com/cdk/. This code has tested with CDK [1.19.0]

```npm install -g  aws-cdk@1.19.0```

```cd connected-vehicle-lab/digital-shadow/connected-vehicle-app-cdk ```

```npm install ```  install npm packages required for connected-vehicle-app-cdk.

Now fire cdk synth command to validate the setup. If it’s a YAML output that means everything is in order 

```cdk synth```

Open connected-vehicle-app-cdk/lib/connected-vehicle-app-cdk-stack.js into IDE
It will create - 
1. Cloudfront distribution of the website
2. Download the source code and create S3 bucket and website
3. Identity pool and allow unauthenticated identities (only meant to simplify the setup otherwise always use Authenticated identities)
4. IoT Device and Policy. We will use AWS IoT Console to create a X509 Certificate and associate with this policy.

Now lest deploy the stack

```cdk bootstrap```  if you are using cdk first time in your AWS account

```cdk deploy```

Do you wish to deploy these changes (y/n)? y

![Cloudformation Execution](https://amitji-tech.s3.amazonaws.com/CFRun.png)

Cloudfront distribution takes a while. So pls wait and have a cup of coffee.
After successful run, You will get below output from cdk - 

1) connected-vehicle-app.unauthenticatedRoleArn = arn:aws:iam::<AWS_account_ID>:role/connected-vehicle-app-UnAuth<randon-char>
2) connected-vehicle-app.ConnectedVehicleApp = <random-char>.cloudfront.net/demo-car/demo.html
3) connected-vehicle-app.ConnectedVehicleBucket = connected-vehicle-app-<AWS_account_ID>
4) connected-vehicle-app.identityPoolId = us-east-1:<random-char>
5) connected-vehicle-app.deviceName = tcu
6) connected-vehicle-app.devicePolicy = devicePolicy

####  Device Enviornment Configuration and Authentication

Now lets open AWS IoT Core console page > Manage > open ‘tcu’ things page.

We will generate the certificate and associate the policy- 
Click on security > create certificate > activate  and download individual *-private.pem.key and *-certificate.pem.crt files.  > Attach policy 'devicePolicy'

For both tcuShadowWrite.py and tcuShadowRead.py  -

1) mqttc.configureEndpoint() - Update IoT Endpoint (AWS IoT Core Console > Setting > Custom EndPoint) 
2) mqttc.configureCredentials() - Copy certificate under tcu folder  and update certficate name  

lets install AWSIoTPythonSDK 

```sudo su  ```

```curl https://bootstrap.pypa.io/get-pip.py | sudo -H python3.6  #install PIP for Python 3.6```

```export PATH="$PATH:/usr/local/bin"```

```pip install AWSIoTPythonSDK```
…….
….
Successfully installed AWSIoTPythonSDK-1.4.7

Now open tcuShadowRead.py in Cloud 9 IDE and click run (green button) 
You should see response like

>Connected
>Listening for Delta Messages


Now open tcuShadowWrite.py in Cloud 9 IDE and click run (green button) 
You should see response like

>Connected
> response : accepted , message : {"version":xxx,"timestamp":xxxxx,"clientToken":"xx-xxx-xx-xx"}
>Shadow Update Sent
> response : accepted , message : {"state":{"reported":{"door":"close"}},"metadata":{"reported":{"door":{"timestamp":xxxx}}},"version":xxx,"timestamp":xxx,"clientToken":"xxx-xxx-xxx-xx"}



#### Connected vehicle app
Open connected-vehicle-lab/digital-shadow/demo-car/js/appVariables.js and update IDENTITY_POOL_ID value from cdk output  

Also set IOT_ENDPOINT :  AWS IoT Core Console > Setting > Custom endpoint

Make sure you are out of sudo su ( use exit if its still showing root user)

```exit```

Open a new terminal and run below command to Update the appVariables.js file into s3 bucket ‘connected-vehicle-app-<account-id>’. 


```aws s3 cp  ~/environment/connected-vehicle-lab/digital-shadow/demo-car/js/appVariables.js s3://connected-vehicle-app-<account-id>/demo-car/js/```


Lets open the connected vehicle app. Refer to CDK output connected-vehicle-app.ConnectedVehicleApp . It has your app url. 

Now we have both Things on cloud and device client is ready to communicate.

You should be able to see a virtual car with list of command checkbox. 
Only 3 command Door, Headlight and Window has implemented and rest is for you to implement. 


https://amitji-tech.s3.amazonaws.com/Digital_Shadow_run.gif


## License Summary

This sample code is made available under the MIT-0 license. See the LICENSE file.
