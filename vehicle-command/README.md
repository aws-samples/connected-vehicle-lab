# Build An Alexa Skill 'Open my trunk'


![Alexa Skill and Device gateway](https://amitji-tech.s3.amazonaws.com/Alexa-Device-Shadow.png)

### This is a simple tutorial to introduce a simple Alexa skill and code.

## Skill Architecture
Each skill consists of two basic parts, a front end and a back end.
The front end is the voice interface, or VUI.
The voice interface is configured through the voice interaction model.
The back end is where the logic of your skill resides. In this case, a lambda function which will invoked and interact with AWS IoT Core Device Shadow API.

## Setup
1. Setup environment - Configure Cloud 9 IDE with Alexa CLI (ASK). Initialize ASK CLI with AWS profile
2. Configure Alexa Skills
3. Setup Lambda function. It will get invoked based on identified intent



---

## Additional Resources

### Community
* [Amazon Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html) - Join the conversation!
* [Hackster.io](https://www.hackster.io/amazon-alexa) - See what others are building with Alexa.

### Tutorials & Guides
* [Voice Design Guide](https://developer.amazon.com/designing-for-voice/) - A great resource for learning conversational and voice user interface design.
* [Codecademy: Learn Alexa](https://www.codecademy.com/learn/learn-alexa) - Learn how to build an Alexa Skill from within your browser with this beginner friendly tutorial on Codecademy!

### Documentation
* [Official Alexa Skills Kit Node.js SDK](https://www.npmjs.com/package/ask-sdk) - The Official Node.js SDK Documentation
*  [Official Alexa Skills Kit Documentation](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html) - Official Alexa Skills Kit Documentation
