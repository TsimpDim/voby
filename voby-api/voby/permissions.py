from rest_framework.permissions import BasePermission
from django.apps import apps


class HasAIEnabled(BasePermission):
    """
    Allows access only if the 'enable_ai' option is set to 'true'.
    """

    def has_permission(self, request, view):
        Option = apps.get_model("voby", "Option")
        return Option.objects.filter(key="enable_ai", value="true").exists()
