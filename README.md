
## Practic.io

Practic.io is a webapp for practicing math, languages or
other topics for elementary school students (but can be extended with
content for other audience easily).

This is serverless single page app, using Amazon AWS services
(S3 for storing content, DynamoDB for data, SNS for messaging,
Lambda for data processing)

It is deployed at http://practic.io

To deploy the backend components, you need to install the aws command line
client, and set up ~/.aws/credentials.

To build the javascript part use
``
gulp
``
This will create public/bundle.js using babelify, minimized and with
the required modules.

To run the Jasmine tests use
``
gulp test
``

To deploy the website to an S3 bucket, use
``
sspa deploy_bundle <bucket_name>
``

The app framework is from
https://www.safaribooksonline.com/library/view/serverless-single-page/9781680502084/


## MIT License

Copyright (c) 2015 Ben Rady <benrady@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Creative Commons Attributions

  * HeroImage.jpg is licensed from popularwoodworking.com under the Creative Commons Attribution License (CC BY 3.0 US).
