terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.15.1"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.2.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }

  required_version = "~> 1.0"
}

provider "aws" {
  region = var.aws_region
}

resource "random_pet" "lambda_bucket_name" {
  prefix = "is-even"
  length = 6
}

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = random_pet.lambda_bucket_name.id

  force_destroy = true
}

data "archive_file" "lambda_is_even" {
  type = "zip"

  source_dir  = "${path.module}/isEven"
  output_path = "${path.module}/isEven.zip"
}

resource "aws_s3_object" "lambda_is_even" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "isEven.zip"
  source = data.archive_file.lambda_is_even.output_path

  etag = filemd5(data.archive_file.lambda_is_even.output_path)
}

resource "aws_lambda_function" "is_even" {
  function_name = "isEven"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_is_even.key

  runtime = "nodejs16.x"
  handler = "isEven.handler"

  source_code_hash = data.archive_file.lambda_is_even.output_base64sha256

  role = aws_iam_role.lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "is_even" {
  name = "/aws/lambda/${aws_lambda_function.is_even.function_name}"

  retention_in_days = 7
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function_url" "live" {
  function_name      = aws_lambda_function.is_even.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}