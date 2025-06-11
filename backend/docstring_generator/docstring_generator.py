# docstring_generator.py

import difflib
import re

def add_docstrings(code: str, language: str = "python") -> str:
    if language.lower() == "python":
        return _add_python_docstrings(code)
    elif language.lower() in {"javascript", "java"}:
        return _add_generic_docstrings(code, language.lower())
    else:
        raise ValueError("Unsupported language")

def _add_python_docstrings(code: str) -> str:
    lines = code.splitlines()
    new_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]
        new_lines.append(line)

        if re.match(r"^\s*def\s+\w+\(.*\):", line):
            indent = " " * (len(line) - len(line.lstrip()) + 4)
            docstring = f'{indent}"""Function documentation."""'
            if i + 1 >= len(lines) or '"""' not in lines[i + 1]:
                new_lines.append(docstring)

        elif re.match(r"^\s*class\s+\w+\(?.*?\)?:", line):
            indent = " " * (len(line) - len(line.lstrip()) + 4)
            docstring = f'{indent}"""Class documentation."""'
            if i + 1 >= len(lines) or '"""' not in lines[i + 1]:
                new_lines.append(docstring)

        i += 1

    return "\n".join(new_lines)

def _add_generic_docstrings(code: str, language: str) -> str:
    pattern = {
        "javascript": r"^\s*function\s+\w+\(.*\)\s*\{",
        "java": r"^\s*(public|private|protected)?\s*(static)?\s*\w+\s+\w+\(.*\)\s*\{"
    }[language]

    lines = code.splitlines()
    new_lines = []
    for i, line in enumerate(lines):
        new_lines.append(line)
        if re.match(pattern, line):
            indent = " " * (len(line) - len(line.lstrip()))
            comment = {
                "javascript": f"{indent}/** Function documentation */",
                "java": f"{indent}/** Function documentation */"
            }[language]
            new_lines.append(comment)

    return "\n".join(new_lines)

def preview_docstrings(original_code: str, language: str = "python") -> str:
    updated_code = add_docstrings(original_code, language)
    diff = difflib.unified_diff(
        original_code.splitlines(), updated_code.splitlines(),
        fromfile="original", tofile="updated", lineterm=""
    )
    return "\n".join(diff)
