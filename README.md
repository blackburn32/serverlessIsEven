# Serverless isEven #
A serverless implementation of isEven. Now you can know if your numbers are even, even at mass scale.

This implementation uses an AWS Lambda to quickly determine if your number is even. Advertisements are supported by way of an AWS DynamoDB table.

## Installation ##
First, make sure you have installed terraform, the AWS CLI and have configured your AWS credentials.

Then:
```bash
terraform init
terraform apply
```

Note: The `us-east-1` region will be used by default.

After creating your cloud resources, terraform will spit out the base URL you can use to check if your numbers are even.

## Usage ##
Either use a path variable (IE: `https://baseUrl/:query`) or a text body (IE: `2`) to pass your query to the API.

Queries to the API can be made with any type of request. If a path variable is provided it is prefered over the request body.

Responses will be returned in the following form:
```json
{
    "isEven": "true",
    "query": "2"
}
```

###  Example usage: ###
```bash
 curl baseURL/167
{"isEven":"false","query":"167"}

curl baseURL/abc
{"message":"Invalid query","query":"abc"}

curl baseURL \
  --request POST \
  --header 'Content-Type: text/plain' \
  --data-raw '5'
{"isEven":"false","query":"5"}
```

## Advertisements ##
A random advertisement will be pulled out of the `advertisements` AWS DynamoDB table that is created when you provision the infrastructure. You can add rows to this table through the AWS console, and they will be randomly selected and added to the response of successful requests.

The following row is an example you can follow to add your own advertisements to the table:
```json
{
  "id": {
    "N": "0"
  },
  "ad": {
    "S": "You win! Way to go!"
  }
}
```

The ad will then be included on successful requests:

```bash
 curl baseURL/167
{"isEven":"false","query":"167","ad":"You win! Way to go!"}
```

## Tests ##
To run unit tests against the project, you must have npm installed.

Then:
```bash
npm install
npm test
```

## Contributing ##
Pull requests are welcome.

## License ##
MIT