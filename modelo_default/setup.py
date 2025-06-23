from cx_Freeze import setup, Executable

import sys

sys.setrecursionlimit(10**6)

build_exe_options = {
    "packages": ["tkinter", "progressbar", "openpyxl", "win32com", "xlwings", "pyautogui"],
    "excludes": ["unittest", "navigator-updater", "nbclassic", "nbclient", "nbconvert", "nbformat",
                 "networkx", "nltk", "nose", "notebook", "numba", "numexpr", "numpy", "numpy-base", "numpydoc",
                 "pandas", "pandocfilters", "panel", "param", "paramiko", "parsel", "parso", "partd", "pywhatkit",
                 "pathspec", "patsy", "pep8", "pexpect", "pickleshare", "pillow", "pkginfo", "plotly", "pluggy",
                 "powershell_shortcut", "poyo", "prometheus_client", "prompt-toolkit", "protego", "protobuf",
                 "pure_eval", "flask", "weasyprint", "uvicor", "pyqtwebengine", "pywinpty", "pyqt5", "urlopen", "nltk",
                 "flet", "docx", "requests", "google.generativeai", "PyPDF2", "html2docx", "markdown", "docxcompose",
                 "webbrowser", "torch", "torchvision"],
    "include_files": ["assets/", "languages/", "sap_login.txt", "jobs/"]
}

target = Executable(
    script="main.py",
    target_name="Automatization Model",
    base="Win32GUI",
    copyright="Robert Aron Zimmermann",
    icon="assets/automatization.ico"
)

setup(
    name="Automatization Model",
    version="1.0",
    description="Automatization Model - Developed by Robert Aron Zimmermann robertn@weg.net",
    options={"build_exe": build_exe_options},
    executables=[target],
)

# python setup.py build --force
