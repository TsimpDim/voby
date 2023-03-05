from django.apps import AppConfig


class VobyConfig(AppConfig):
    name = 'voby'

    def ready(self):
        import voby.signals
