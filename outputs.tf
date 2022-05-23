output "baseURL" {
    description = "The URL used to invoke the lambda."

    value = aws_lambda_function_url.live.function_url
}