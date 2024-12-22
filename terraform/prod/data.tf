data "aws_ssm_parameter" "voby_db_user" {
  name = "/VOBY/DB/USER"
}

data "aws_ssm_parameter" "voby_db_host" {
  name = "/VOBY/DB/HOST"
}

data "aws_ssm_parameter" "voby_db_password" {
  name = "/VOBY/DB/PASSWORD"
}

data "aws_ssm_parameter" "voby_db_name" {
  name = "/VOBY/DB/NAME"
}

data "aws_ssm_parameter" "voby_secret_key" {
  name = "/VOBY/SECRET_KEY"
}

data "aws_ssm_parameter" "voby_su_username" {
  name = "/VOBY/SU_USERNAME"
}

data "aws_ssm_parameter" "voby_su_password" {
  name = "/VOBY/SU_PASSWORD"
}

data "aws_ssm_parameter" "voby_su_email" {
  name = "/VOBY/SU_EMAIL"
}

data "aws_subnets" "public" {
  tags = {
    Stack = "main"
  }
}

data "aws_vpc" "vpc" {
  tags = {
    Stack = "main"
  }
}

data "aws_db_instance" "db" {
  tags = {
    Stack = "main"
  }
}

data "template_file" "user_data" {
  template = file("user_data.sh")

  vars = {
    ecs_cluster_name = aws_ecs_cluster.voby.name
  }
}

data "aws_acm_certificate" "voby" {
  tags = {
    Stack = "main"
  }
  most_recent = true
  types = [ "AMAZON_ISSUED" ]
  domain = "voby.tsdim.net"
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "owner-alias"
    values = ["amazon"]
  }

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }

  owners = ["amazon"]
}