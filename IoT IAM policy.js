{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "IoTShadowAccess",
            "Effect": "Allow",
            "Action": [
                "iot:Receive",
                "iot:Subscribe",
                "iot:Connect",
                "iot:GetThingShadow",
                "iot:UpdateThingShadow"
            ],
            "Resource": "*"
        }
    ]
}