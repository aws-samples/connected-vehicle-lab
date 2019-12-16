const cdk = require('@aws-cdk/core');
const s3 = require('@aws-cdk/aws-s3');
const cf = require('@aws-cdk/aws-cloudfront');
const iam = require('@aws-cdk/aws-iam');
const s3Deploy = require('@aws-cdk/aws-s3-deployment');
const cognito = require('@aws-cdk/aws-cognito');
const awsIoT = require('@aws-cdk/aws-iot');



class ConnectedVehicleAppCdkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    //Initailize the name
    var bucketName = "connected-vehicle-app-" +  cdk.Aws.ACCOUNT_ID
    var poolName = "connected-vehicle-identity-pool-" + cdk.Aws.ACCOUNT_ID
   

    // Setup the origin access identiy for cloud front
     cf.cloudFrontOriginAccessIdentityConfig = { comment: cdk.stackName };
       const oai = new cf.CfnCloudFrontOriginAccessIdentity(this, 'OAI', {cloudFrontOriginAccessIdentityConfig : { comment: this.stackName }
     });

    // The code that defines your stack goes here
    var webBucket = new s3.Bucket(this, "vehicle-app-website", {
     versioned: false, bucketName: bucketName , websiteIndexDocument: 'index.html' 
    });
    
    webBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [webBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(oai.attrS3CanonicalUserId)],
    }));
   
    var distribution = new cf.CloudFrontWebDistribution(this, 'Distribution', {
    originConfigs: [{
        behaviors: [{ isDefaultBehavior: true , 
          allowedMethods : cf.CloudFrontAllowedMethods.ALL, 
          cachedMethods : cf.CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
          defaultTtl : 0,
          maxTtl : 0,
          minTtl : 0,
          compress : false 
        }],
        s3OriginSource: {
            s3BucketSource: webBucket,
            originAccessIdentityId: oai.ref,
        },
    }],
    errorConfigurations: [{
        errorCode: 403,
        responseCode: 200,
        responsePagePath: '/error.html',
    }, {
        errorCode: 404,
        responseCode: 200,
        responsePagePath: '/index.html',
    }],
    comment:  webBucket.bucketName,
    viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    priceClass : cf.PriceClass.PRICE_CLASS_ALL
    });

    
    
    
    new s3Deploy.BucketDeployment(this, 'DeployWebsite', {
        sources : [s3Deploy.Source.bucket(s3.Bucket.fromBucketName(this, 'SourceBucket', 'smrt-parking'),'demo-car2.zip')],
        destinationBucket: webBucket,
        distribution: distribution,
    });

    new cdk.CfnOutput(this, "ConnectedVehicleApp", {description : 'Connected Vehicle App', value : distribution.domainName + '/demo-car/demo.html'}) 


    //Create a new Idenitity pool and allow Unauthenticated Identities  
    const identityPool = new cognito.CfnIdentityPool(this, "cognitoIdentityPool", {allowUnauthenticatedIdentities : true, 
      identityPoolName : poolName})   

    //Create an unauthenticated role  
    const unauthenticatedRole = new iam.Role(this, "UnAuth", {
        assumedBy: new iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
          "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
          "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "unauthenticated" },
      }, "sts:AssumeRoleWithWebIdentity")
      });

    //Attach required iot:* policy to the unauthenticated role  
    unauthenticatedRole.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ["iot:Connect","iot:Subscribe","iot:Receive","iot:GetThingShadow","iot:UpdateThingShadow"] }));


    new cdk.CfnOutput(this, 'identityPoolId', { value: identityPool.ref , description : 'Identity Pool Id'});
    new cdk.CfnOutput(this, 'unauthenticatedRoleArn', { value: unauthenticatedRole.roleArn , description : 'Unauthenticated Role'});

   // Attach idenitity pool with unauthenticated role
    const attachment = new cognito.CfnIdentityPoolRoleAttachment(this, "cognitoIdentityPoolRoleAttachment" , {
              identityPoolId : identityPool.ref  ,
              roles: {
                'unauthenticated': unauthenticatedRole.roleArn
            }
          })
  
  //create an thing 'tcu'       
  var thing = new awsIoT.CfnThing(this, "IoTDevice", {
  thingName : "tcu"   
    })

 var devicePolicyDocument = {
        "Version": "2012-10-17",
        "Statement": [
              {
                "Sid": "deviceAccessPolicyStatement",
                "Effect": "Allow",
                "Action": [
                  "iot:Receive",
                  "iot:Subscribe",
                  "iot:Connect",
                  "iot:GetThingShadow",
                  "iot:DeleteThingShadow",
                  "iot:UpdateThingShadow",
                  "iot:Publish"
                ],
                "Resource": "*"
            }
        ]
      }; 

  //Create policy    
  var devicePolicy = new awsIoT.CfnPolicy(this, "DevicePolicyDcoument", { policyDocument : devicePolicyDocument, policyName: "devicePolicy"}) 
  new cdk.CfnOutput(this, 'deviceName', { value: thing.thingName , description : 'Device Name'});
  new cdk.CfnOutput(this, 'devicePolicy', { value: devicePolicy.policyName , description : 'Policy Name'});

  
  }
}

module.exports = { ConnectedVehicleAppCdkStack }
