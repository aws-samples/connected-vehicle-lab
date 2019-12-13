const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const ConnectedVehicleAppCdk = require('../lib/connected-vehicle-app-cdk-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ConnectedVehicleAppCdk.ConnectedVehicleAppCdkStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});