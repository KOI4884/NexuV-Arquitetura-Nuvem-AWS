provider "aws" {
  region = "us-east-1"
}

# 1. Repositório ECR
resource "aws_ecr_repository" "payment_app" {
  name                 = "payment-app-repo"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

# 2. Cluster ECS
resource "aws_ecs_cluster" "main" {
  name = "payment-cluster"
}

# 3. Referência à Role existente do AWS Academy Learner Lab
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# 4. Grupo de Logs no CloudWatch com retenção (FinOps)
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/payment-task"
  retention_in_days = 1 
}

# 5. Task Definition Fargate (com mapeamento de Logs habilitado)
resource "aws_ecs_task_definition" "app" {
  family                   = "payment-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([{
    name      = "payment-container"
    image     = "${aws_ecr_repository.payment_app.repository_url}:latest"
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}
# --- NOVOS RECURSOS: DYNAMODB ---

resource "aws_dynamodb_table" "users" {
  name           = "CyberBank_Users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "username"

  attribute {
    name = "username"
    type = "S"
  }
}

resource "aws_dynamodb_table" "transactions" {
  name           = "CyberBank_Transactions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "transaction_id"

  attribute {
    name = "transaction_id"
    type = "S"
  }
}

# Populando o Banco de Dados via IaC
resource "aws_dynamodb_table_item" "joao" {
  table_name = aws_dynamodb_table.users.name
  hash_key   = aws_dynamodb_table.users.hash_key
  item = <<ITEM
{
  "username": {"S": "joao"},
  "password": {"S": "senha123"},
  "name": {"S": "João Gustavo"},
  "balance": {"N": "150.00"}
}
ITEM
}

resource "aws_dynamodb_table_item" "demay" {
  table_name = aws_dynamodb_table.users.name
  hash_key   = aws_dynamodb_table.users.hash_key
  item = <<ITEM
{
  "username": {"S": "demay"},
  "password": {"S": "senha123"},
  "name": {"S": "Demay"},
  "balance": {"N": "0.00"}
}
ITEM
}
# Outputs para facilitar a operação
output "ecr_repository_url" {
  value = aws_ecr_repository.payment_app.repository_url
}
