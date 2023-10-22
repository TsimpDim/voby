from rest_framework import serializers
from .models import VClass, Set, Word, Example, QuizAnswer, Profile, TestAttempt, UserShortcuts, Translation
from datetime import datetime
import random

class ExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Example
        fields = "__all__"


class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = "__all__"

class RelatedWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ('id', 'word', 'set')

class WordSerializer(serializers.ModelSerializer):
    examples = ExampleSerializer(many=True, read_only=True)
    set_name = serializers.SerializerMethodField()
    translations = TranslationSerializer(many=True, read_only=True)

    def get_set_name(self, obj):
        return obj.set.name

    def to_representation(self, instance):
        response = super().to_representation(instance)
        new_related_words = Word.objects.filter(id__in=response['related_words'])#.values('id', 'word', 'set')
        response["related_words"] = RelatedWordSerializer(new_related_words, many=True).data
        return response

    class Meta:
        model = Word
        fields = '__all__'

class TestQuestionSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['translations'] = ' / '.join([t['value'] for t in TranslationSerializer(Translation.objects.filter(id__in=response['translations']), many=True).data])
        if random.random() < 0.5:
            response['word'], response['translations'] = response['translations'], response['word']
        
        return response

    class Meta:
        model = Word
        fields = ('word', 'translations')

class SetSerializer(serializers.ModelSerializer):
    words = WordSerializer(many=True, read_only=True)
    vclass_info = serializers.SerializerMethodField()
    words_today = serializers.SerializerMethodField()

    def get_words_today(self, obj):
        count = Word.objects.filter(set=obj, created__date=datetime.today()).count()
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

class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = "__all__"

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"

class TestAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestAttempt
        fields = "__all__"

class UserShortcutsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserShortcuts
        fields = "__all__"
