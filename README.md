serverless deploy to aws
core app is using NodeJs.

use steps as follows:

1. npm install -g serverless
2. serverless config credentials --provider aws --key [AWS Access Key ID] --secret [Secret Access Key]
3. sls deploy
Notes: needs serverless.yml to be a serverless project, and in this file service will be the aws lambda name as the result.
