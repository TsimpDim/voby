variable "region" {
    type = string
    default = "eu-west-1"
}

variable "environment" {
    type = string
    default = "prod"
}

variable "service" {
    type = string
    default = "voby"
}

variable "ec2_instance_type" {
    type = string
    default = "t2.micro"
}