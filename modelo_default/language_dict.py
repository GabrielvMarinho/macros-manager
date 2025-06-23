import os
import sys
import json
import getpass
modelo_default_path = os.path.join(os.getcwd(), "modelo_default")

class Language:
    def __init__(self, language: str):
        with open(f'{modelo_default_path}\\languages/{language}.json', 'r', encoding='utf-8') as file:
            self.translations = json.load(file)

    def search(self, desired_field: str):
        text = str(self.translations.get(desired_field, self.translations.get('not_found'))).replace('$username',
                                                                                                     getpass.getuser().upper())
        return text
