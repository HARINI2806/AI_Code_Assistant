# executor/runner.py

import os
import ast
import traceback
import sys

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

def run_function_from_codebase(codebase_path, function_name, args=None, kwargs=None):
    args = args or []
    kwargs = kwargs or {}

# if not isinstance(kwargs, dict):
#     raise ValueError("`kwargs` must be a dictionary")

    main_path = os.path.join(codebase_path, "main.py")
    if not os.path.exists(main_path):
        raise FileNotFoundError(f"{main_path} not found.")

    # Add the codebase folder to sys.path so Python can resolve local imports
    sys.path.insert(0, os.path.abspath(codebase_path))

    try:
        with open(main_path, "r", encoding="utf-8") as f:
            code = f.read()

        global_ns = {}
        exec(code, global_ns)
        result = global_ns[function_name](*args, **kwargs)
        return result

    except Exception as e:
        raise RuntimeError(f"❌ Error running `{function_name}` from `{main_path}`:\n{e}")

    finally:
        # Clean up sys.path to avoid pollution
        sys.path.pop(0)