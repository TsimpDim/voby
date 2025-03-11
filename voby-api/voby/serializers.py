from rest_framework import serializers
from .models import VClass, Set, Word, Example, QuizAnswer, Profile, TestAttempt, UserShortcuts, Translation, Option, Tag
import random

class ExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Example
        fields = "__all__"

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"

class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = "__all__"

class RelatedWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ('id', 'word', 'set', 'translations')

class WordInfoSerializer(serializers.ModelSerializer):
    examples = ExampleSerializer(many=True, read_only=True)
    set_name = serializers.SerializerMethodField()
    translations = TranslationSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    # TODO: SET NAME DOES NOT WORK BECAUSE NOW SET IS AN ARRAY
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

class WordAllSerializer(serializers.ModelSerializer):
    examples = ExampleSerializer(many=True, read_only=True)
    translations = TranslationSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    def to_representation(self, instance):
        response = super().to_representation(instance)
        new_related_words = Word.objects.filter(id__in=response['related_words'])#.values('id', 'word', 'set')
        response["related_words"] = RelatedWordSerializer(new_related_words, many=True).data
        return response

    class Meta:
        model = Word
        fields = '__all__'

class TestQuestionSerializer(serializers.ModelSerializer):
    def to_representation(self, instance: Word):
        response = super().to_representation(instance)
        response['translations'] = ' / '.join([t['value'] for t in TranslationSerializer(Translation.objects.filter(id__in=response['translations']), many=True).data])
        vclass = VClass.objects.get(id=instance.set.vclass.id)
        if not vclass:
            return None
        
        response['source_language'] = vclass.source_language
        response['target_language'] = vclass.target_language
        if random.random() < 0.5:
            response['word'], \
            response['translations'], \
            response['source_language'], \
            response['target_language'] = response['translations'], \
            response['word'], \
            response['target_language'], \
            response['source_language']
        
        return response

    class Meta:
        model = Word
        fields = ('word', 'translations')

class GermanNounTestQuestionSerializer(serializers.ModelSerializer):
    gender = serializers.SerializerMethodField()
    translations = TranslationSerializer(many=True, read_only=True)
    
    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['word'] = response['word'][4:]
        response['translations'] = ' / '.join([v['value'] for v in response['translations']])
        return response
    
    def get_gender(self, obj):
        return obj.word[:3]

    class Meta:
        model = Word
        fields = ('word', 'gender', 'translations')

class SetInfoSerializer(serializers.ModelSerializer):
    has_words = serializers.SerializerMethodField()
    has_favorites = serializers.SerializerMethodField()
    vclass_info = serializers.SerializerMethodField()

    def get_has_words(self, obj):
        return obj.words.count()

    def get_has_favorites(self, obj):
        return obj.words.filter(favorite=True).count()
    
    def get_vclass_info(self, obj):
        vclass = obj.vclass
        return {
            'id': vclass.id,
            'name': vclass.name,
            'source_language': vclass.source_language,
            'target_language': vclass.target_language
        }
    
    class Meta:
        model = Set
        fields = ['id', 'name', 'has_words', 'vclass_info', 'has_favorites']

class SetNoVClassSerializer(serializers.ModelSerializer):
    has_words = serializers.SerializerMethodField()
    has_favorites = serializers.SerializerMethodField()
    has_german_favorites = serializers.SerializerMethodField()

    def get_has_words(self, obj):
        return obj.words.count()

    def get_has_favorites(self, obj):
        return obj.words.filter(favorite=True).count()

    def get_has_german_favorites(self, obj):
        return obj.words.filter(favorite=True, word__regex=r'^([dD]er [A-Z][a-z]+)$|^([dD]ie [A-Z][a-z]+)$|^([dD]as [A-Z][a-z]+)$').count()

    class Meta:
        model = Set
        fields = ['id', 'name', 'has_words', 'has_favorites', 'has_german_favorites']

class SetAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = '__all__'

class ClassSerializer(serializers.ModelSerializer):
    sets = SetNoVClassSerializer(many=True, read_only=True)
    has_german_nouns = serializers.SerializerMethodField()

    def get_has_german_nouns(self, obj):
        return Word.objects.filter(set__vclass=obj,word__regex=r'^([dD]er [A-Z][a-z]+)$|^([dD]ie [A-Z][a-z]+)$|^([dD]as [A-Z][a-z]+)$').count() > 0

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

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = "__all__"

