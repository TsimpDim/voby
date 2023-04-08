from rest_framework import serializers
from .models import VClass, Set, Word, Example
from datetime import datetime

class ExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Example
        fields = "__all__"

class WordSerializer(serializers.ModelSerializer):
    examples = ExampleSerializer(many=True, read_only=True)

    class Meta:
        model = Word
        fields = '__all__'

class SetSerializer(serializers.ModelSerializer):
    words = WordSerializer(many=True, read_only=True)
    vclass_info = serializers.SerializerMethodField()
    words_today = serializers.SerializerMethodField()

    def get_words_today(self, obj):
        count = Word.objects.filter(set=obj, created=datetime.today()).count()
        return count

    def get_vclass_info(self, obj):
        vclass = obj.vclass
        return {
            'name': vclass.name,
            'source_language': vclass.source_language,
            'target_language': vclass.target_language
        }
    
    def to_representation(self, instance):
        response = super().to_representation(instance)
        to_sort_desc = self.context.get('sort') == 'date_desc'
        response["words"] = sorted(response["words"], key=lambda x: x["created"], reverse=to_sort_desc)
        return response

    class Meta:
        model = Set
        fields = '__all__'

class ClassSerializer(serializers.ModelSerializer):
    sets = SetSerializer(many=True, read_only=True)

    class Meta:
        model = VClass
        fields = "__all__"
