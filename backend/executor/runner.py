# backend/executor/runner.py

import importlib.util
import os
import sys
import traceback
import types
from contextlib import redirect_stdout
from io import StringIO
import subprocess
def import_module_from_path(module_name: str, file_path: str) -> types.ModuleType:
    """Dynamically imports a Python module from a given file path."""
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


def import_all_python_modules(base_path: str) -> dict:
    """
    Recursively imports all Python files in the given base path.
    Returns a dict mapping `module_name` -> module object.
    """
    module_map = {}

    for root, _, files in os.walk(base_path):
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, base_path)
                module_name = rel_path.replace(os.sep, ".").rsplit(".py", 1)[0]
                try:
                    mod = import_module_from_path(module_name, file_path)
                    module_map[module_name] = mod
                except Exception as e:
                    print(f"[Import error] {file_path} - {e}")

    return module_map


def run_function_by_name(base_path: str, function_name: str, *args, **kwargs) -> dict:
    """
    Imports all modules from the base path,
    searches for a callable by name, and runs it.

    Supports full names like: `math_utils.add`
    """
    modules = import_all_python_modules(base_path)

    # Try full match (e.g., utils.math.add)
    if "." in function_name:
        mod_path, fn_name = function_name.rsplit(".", 1)
        module = modules.get(mod_path)
        if not module:
            return {"error": f"Module '{mod_path}' not found"}
        func = getattr(module, fn_name, None)
    else:
        # Fallback: search all modules for matching function
        func = None
        for mod in modules.values():
            if hasattr(mod, function_name):
                func = getattr(mod, function_name)
                break

    if not callable(func):
        return {"error": f"Function '{function_name}' not found or not callable"}

    try:
        f = StringIO()
        with redirect_stdout(f):
            result = func(*args, **kwargs)
        output = f.getvalue()

        return {
            "output": output.strip(),
            "result": result,
            "error": None
        }

    except Exception:
        return {
            "output": "",
            "result": None,
            "error": traceback.format_exc()
        }

def run_java_function(java_file_path, class_name, method_name, *args):
    # Compile Java
    subprocess.run(["javac", java_file_path], check=True)
    # Execute the class
    result = subprocess.run(["java", class_name], capture_output=True, text=True)
    return result.stdout