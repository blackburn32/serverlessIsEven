output "lambda_bucket_name" {
  description = "Name of the S3 bucket used to store function code."

  value = aws_s3_bucket.lambda_bucket.id
}

output "lambda_function_url" {
    description = "The URL used to invoke the lambda."

    value = aws_lambda_function_url.live.function_url
}