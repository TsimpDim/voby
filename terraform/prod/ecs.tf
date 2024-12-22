resource "aws_ecs_cluster" "voby" {
  name = "voby"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

# resource "aws_ecr_repository" "voby" {
#   name                 = "voby"
#   image_tag_mutability = "MUTABLE"
# }

resource "aws_ecs_task_definition" "voby" {
  family       = "voby"
  container_definitions = jsonencode([
    {
      name                  = "voby-api"
      image                 = "voby-api"
      cpu                   = 1
      memory                = 256
      requires_capabilities = ["EC2"]
      cpu_architecture      = "X86_64"
      task_role_arn         = aws_iam_role.voby-api-ecs-role.arn
      essential             = true
      portMappings = [
        {
          containerPort = 443
          hostPort      = 443
        }
      ],
      environment = [
        { name = "V_DB_NAME", value = tostring(data.aws_ssm_parameter.voby_db_name.value) },
        { name = "V_DB_PASSWORD", value = tostring(data.aws_ssm_parameter.voby_db_password.value) },
        { name = "V_DB_USER", value = tostring(data.aws_ssm_parameter.voby_db_user.value) },
        { name = "V_DB_HOST", value = tostring(data.aws_ssm_parameter.voby_db_host.value) },
        { name = "SECRET_KEY", value = tostring(data.aws_ssm_parameter.voby_secret_key.value) },
        { name = "DJANGO_SUPERUSER_USERNAME", value = tostring(data.aws_ssm_parameter.voby_su_username.value) },
        { name = "DJANGO_SUPERUSER_PASSWORD", value = tostring(data.aws_ssm_parameter.voby_su_password.value) },
        { name = "DJANGO_SUPERUSER_EMAIL", value = tostring(data.aws_ssm_parameter.voby_su_email.value) }

      ]
      image = "029557209854.dkr.ecr.eu-west-1.amazonaws.com/voby:latest"
    }
  ])

  volume {
    name      = "service-storage"
    host_path = "/ecs/service-storage"
  }
}

resource "aws_iam_role" "voby-api-ecs-role" {
  name = "VobyAPI_ECS_Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ecs.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "voby-api-ecs-policy" {
  name = "Voby_API_ECS_Service_Role"
  role = aws_iam_role.voby-api-ecs-role.id

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:Describe*",
          "elasticloadbalancing:DeregisterInstancesFromLoadBalancer",
          "elasticloadbalancing:DeregisterTargets",
          "elasticloadbalancing:Describe*",
          "elasticloadbalancing:RegisterInstancesWithLoadBalancer",
          "elasticloadbalancing:RegisterTargets",
          "ec2:DescribeTags",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogStreams",
          "logs:PutSubscriptionFilter",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_security_group" "ecs_instances" {
  name        = "voby_ECS_SecurityGroup_${var.environment}"
  description = "Security group for ECS instances"
  vpc_id      = data.aws_vpc.vpc.id

  # Allow inbound traffic from ALB security group on container port (e.g., 443)
  ingress {
    description     = "Allow traffic from ALB on port 443"
    from_port       = 443
    to_port         = 443
    protocol        = "TCP"
    security_groups = [aws_security_group.alb.id] # Reference to the ALB security group
  }

  # Allow all outbound traffic for ECS tasks
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_lb" "voby" {
  name               = "voby-alb"
  load_balancer_type = "application"
  internal           = false
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.public.ids
}

resource "aws_security_group" "alb" {
  name        = "voby_ALB_SecurityGroup_${var.environment}"
  description = "Security group for ALB"
  vpc_id      = data.aws_vpc.vpc.id

  egress {
    description = "Allow all egress traffic"
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTP traffic from the Internet"
    from_port   = 80
    to_port     = 80
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS traffic from the Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_alb_listener" "ecs-alb-https-listener" {
  load_balancer_arn = aws_lb.voby.id
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.voby.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.https_target_group.arn
  }
}

resource "aws_alb_listener" "ecs-alb-http-listener" {
  load_balancer_arn = aws_lb.voby.arn
  port              = "80"
  protocol          = "HTTP"
  depends_on        = [aws_alb_target_group.https_target_group]

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.https_target_group.arn
  }
}

resource "aws_alb_target_group" "https_target_group" {
  name        = "voby-tg"
  port        = 443
  protocol    = "HTTPS"
  vpc_id      = data.aws_vpc.vpc.id

  health_check {
    path                = "/voby/health"
    port                = "traffic-port"
    healthy_threshold   = 5
    unhealthy_threshold = 2
    timeout             = 2
    interval            = 30
  }
}


resource "aws_ecs_service" "voby-api" {
  name            = "voby"
  cluster         = aws_ecs_cluster.voby.id
  task_definition = aws_ecs_task_definition.voby.arn
  desired_count   = 1
  iam_role        = aws_iam_role.voby-api-ecs-role.arn
  launch_type     = "EC2"

  load_balancer {
    target_group_arn = aws_alb_target_group.https_target_group.arn
    container_name   = "voby-api"
    container_port   = "443"
  }
}

resource "aws_autoscaling_group" "ecs_autoscaling_group" {
  name                  = "${var.service}_ASG_${var.environment}"
  max_size              = 1
  min_size              = 1
  vpc_zone_identifier   = data.aws_subnets.public.ids
  health_check_type     = "EC2"
  protect_from_scale_in = true

  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupPendingInstances",
    "GroupStandbyInstances",
    "GroupTerminatingInstances",
    "GroupTotalInstances"
  ]

  launch_template {
    id      = aws_launch_template.ec2_launch_template.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
  }

  lifecycle {
    create_before_destroy = true
  }
}
