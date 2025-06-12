import ast
import os
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SUPPORTED_LANGUAGES = {"python", "javascript", "java"}

def extract_python_targets(source_code: str) -> list[dict]:
    """Find Python functions or classes without docstrings."""
    tree = ast.parse(source_code)
    targets = []

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            if ast.get_docstring(node) is None:
                targets.append({
                    "name": node.name,
                    "start": node.lineno,
                    "type": type(node).__name__,
                })
    return targets

async def generate_docstring(code_snippet: str, language: str = "python") -> str:
    prompt = f"Generate a {language} docstring for the following {language} code:\n\n{code_snippet}"
    res = await client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return res.choices[0].message.content.strip()

async def insert_docstring(code: str, target: dict, docstring: str, language: str = "python") -> str:
    lines = code.splitlines()
    index = target["start"]
    indent = len(lines[index - 1]) - len(lines[index - 1].lstrip())

    if language == "python":
        doc_line = f'{" " * (indent + 4)}""" {docstring} """'
        lines.insert(index, doc_line)

    elif language == "javascript":
        comment_lines = [' ' * (indent + 2) + line for line in format_jsdoc(docstring).split("\n")]
        lines.insert(index, "\n".join(comment_lines))

    elif language == "java":
        comment_lines = [' ' * (indent + 2) + line for line in format_javadoc(docstring).split("\n")]
        lines.insert(index, "\n".join(comment_lines))

    return "\n".join(lines)

def format_jsdoc(text: str) -> str:
    return "/**\n" + "\n".join([f" * {line}" for line in text.split("\n")]) + "\n */"

def format_javadoc(text: str) -> str:
    return "/**\n" + "\n".join([f" * {line}" for line in text.split("\n")]) + "\n */"

async def batch_generate_docstrings(source_code: str, language: str = "python") -> dict:
    assert language.lower() in SUPPORTED_LANGUAGES, f"Unsupported language: {language}"
    updated_code = source_code

    if language == "python":
        targets = extract_python_targets(source_code)
    else:
        # fallback: line-based detection for JS/Java (simple)
        targets = []
        for i, line in enumerate(source_code.splitlines()):
            if ("function" in line or "class" in line) and not line.strip().startswith("//"):
                targets.append({"start": i + 1, "name": f"block@{i}", "type": "Function"})

    # Insert all docstrings
    for target in reversed(targets):  # bottom-up to preserve line numbers
        snippet = "\n".join(updated_code.splitlines()[target["start"] - 1: target["start"] + 5])
        docstring = await generate_docstring(snippet, language)
        updated_code = await insert_docstring(updated_code, target, docstring, language)

    return {
        "original": source_code,
        "modified": updated_code,
        "modified_functions": [t["name"] for t in targets]
    }
