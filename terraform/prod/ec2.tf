resource "aws_launch_template" "ec2_launch_template" {
  name                   = "${var.service}_EC2_LaunchTemplate_${var.environment}"
  image_id               = data.aws_ami.amazon_linux_2.id
  instance_type          = var.ec2_instance_type
  vpc_security_group_ids = [aws_security_group.ec2.id]
  user_data              = base64encode(data.template_file.user_data.rendered)

  iam_instance_profile {
    arn = aws_iam_instance_profile.ec2_instance_role_profile.arn
  }

  network_interfaces {
    security_groups = [aws_security_group.ecs_instances.id]
  }

  monitoring {
    enabled = false
  }
}


resource "aws_security_group" "ec2" {
  name        = "${var.service}_EC2_Instance_SecurityGroup_${var.environment}"
  description = "Security group for EC2 instances in ECS cluster"
  vpc_id      = data.aws_vpc.vpc.id

  ingress {
    description      = "Allow all HTTP ingress traffic"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "Allow all HTTPS ingress traffic"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    description = "Allow all egress traffic"
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.service}_EC2_Instance_SecurityGroup_${var.environment}"
  }
}

resource "aws_iam_role_policy_attachment" "ec2_instance_role_policy" {
  role       = aws_iam_role.voby-api-launch-template.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ec2_instance_role_profile" {
  name = "${var.service}_EC2_InstanceRoleProfile_${var.environment}"
  role = aws_iam_role.voby-api-launch-template.id
}

resource "aws_iam_role" "voby-api-launch-template" {
  name = "VobyAPI_EC2_LaunchTemplate_Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
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
