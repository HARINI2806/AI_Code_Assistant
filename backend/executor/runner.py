# executor/runner.py

import os
import ast
import traceback

def find_python_files(codebase_path: str) -> list[str]:
    py_files = []
    for root, _, files in os.walk(codebase_path):
        for file in files:
            if file.endswith(".py"):
                py_files.append(os.path.join(root, file))
    return py_files

def extract_function_source(file_path: str, function_name: str) -> str | None:
    with open(file_path, "r", encoding="utf-8") as f:
        source = f.read()

    try:
        tree = ast.parse(source)
        for node in tree.body:
            if isinstance(node, ast.FunctionDef) and node.name == function_name:
                lines = source.splitlines()
                func_lines = lines[node.lineno - 1: node.end_lineno]
                return "\n".join(func_lines)
    except Exception:
        pass
    return None

def run_function_from_codebase(codebase_path: str, function_name: str, args: list = [], kwargs: dict = {}) -> str:
    files = find_python_files(codebase_path)

    for file in files:
        source = extract_function_source(file, function_name)
        if source:
            try:
                local_ns = {}
                exec(source, globals(), local_ns)

                if function_name not in local_ns:
                    raise ValueError(f"Function `{function_name}` not defined properly.")

                result = local_ns[function_name](*args, **kwargs)
                return f"✅ Output from `{function_name}`:\n{result}"
            except Exception as e:
                return f"❌ Error running `{function_name}` from `{file}`:\n{traceback.format_exc()}"

    return f"⚠️ Function `{function_name}` not found in codebase."