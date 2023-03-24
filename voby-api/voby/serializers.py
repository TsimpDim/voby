from rest_framework import serializers
from .models import VClass, Set, Word

class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = '__all__'

class SetSerializer(serializers.ModelSerializer):
    words = WordSerializer(many=True, read_only=True)
    vclass_info = serializers.SerializerMethodField()

    def get_vclass_info(self, obj):
        vclass = obj.vclass
        return {
            'name': vclass.name,
            'source_language': vclass.source_language,
            'target_language': vclass.target_language
        }

    class Meta:
        model = Set
        fields = '__all__'

class ClassSerializer(serializers.ModelSerializer):
    sets = SetSerializer(many=True, read_only=True)

    class Meta:
        model = VClass
        fields = "__all__"
