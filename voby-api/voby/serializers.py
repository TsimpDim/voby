from rest_framework import serializers
from .models import VClass, Set

class ClassSerializer(serializers.ModelSerializer):
    sets = serializers.SerializerMethodField()

    def get_sets(self, obj):
        return Set.objects.filter(class_id=obj.id)

    class Meta:
        model = VClass
        fields = "__all__"
