#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { ConnectedVehicleAppCdkStack } = require('../lib/connected-vehicle-app-cdk-stack');

const app = new cdk.App();

new ConnectedVehicleAppCdkStack(app, 'connected-vehicle-app', { env: { region: 'us-east-1' }});
