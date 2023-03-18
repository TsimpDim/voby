from rest_framework import serializers
from .models import VClass, Set


class SetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = '__all__'

class ClassSerializer(serializers.ModelSerializer):
    sets = SetSerializer(many=True, read_only=True)
    class Meta:
        model = VClass
        fields = "__all__"

