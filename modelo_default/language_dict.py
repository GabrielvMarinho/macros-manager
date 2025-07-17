import os
import sys
import json
import getpass
import importlib

class Language:
    def __init__(self, language: str):

        module = importlib.import_module(f"modelo_default.languages.{language}")
        content = getattr(module, "content")

        self.translations = json.loads(content)

    def search(self, desired_field: str):
        text = str(self.translations.get(desired_field, self.translations.get('not_found'))).replace('$username',
                                                                                                     getpass.getuser().upper())
        return text
