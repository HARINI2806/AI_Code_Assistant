# executor/runner.py

import os
import ast
import traceback
import sys

def find_python_files(codebase_path: str) -> list[str]:
    """Find all Python files in the codebase"""
    py_files = []
    for root, _, files in os.walk(codebase_path):
        for file in files:
            if file.endswith(".py"):
                py_files.append(os.path.join(root, file))
    return py_files

def find_runnable_python_files(base_path: str) -> list[str]:
    """Find all directories containing main.py files (runnable codebases)"""
    runnable_codebases = []
    
    if not os.path.exists(base_path):
        return runnable_codebases
    
    # Check if base_path itself has main.py
    main_path = os.path.join(base_path, "main.py")
    if os.path.exists(main_path):
        runnable_codebases.append("main.py")
    
    # Check subdirectories for main.py
    for item in os.listdir(base_path):
        item_path = os.path.join(base_path, item)
        if os.path.isdir(item_path):
            main_file = os.path.join(item_path, "main.py")
            if os.path.exists(main_file):
                runnable_codebases.append(f"{item}/main.py")
    
    return runnable_codebases

def extract_function_source(file_path: str, function_name: str) -> str | None:
    """Extract source code of a specific function from a Python file"""
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
    """Run a function from a codebase's main.py file"""
    args = args or []
    kwargs = kwargs or {}

    # Construct the correct main.py path
    # If codebase_path already ends with main.py, use it as is
    if codebase_path.endswith("main.py"):
        main_path = codebase_path
        # Get the directory containing main.py for sys.path
        codebase_dir = os.path.dirname(main_path)
    else:
        # Otherwise, append main.py to the path
        main_path = os.path.join(codebase_path, "main.py")
        codebase_dir = codebase_path
    
    if not os.path.exists(main_path):
        raise FileNotFoundError(f"{main_path} not found.")

    # Add the codebase folder to sys.path so Python can resolve local imports
    abs_codebase_dir = os.path.abspath(codebase_dir)
    sys.path.insert(0, abs_codebase_dir)

    try:
        with open(main_path, "r", encoding="utf-8") as f:
            code = f.read()

        global_ns = {}
        exec(code, global_ns)
        
        if function_name not in global_ns:
            raise RuntimeError(f"Function '{function_name}' not found in {main_path}")
            
        result = global_ns[function_name](*args, **kwargs)
        return result

    except Exception as e:
        raise RuntimeError(f"❌ Error running `{function_name}` from `{main_path}`:\n{e}")

    finally:
        # Clean up sys.path to avoid pollution
        if abs_codebase_dir in sys.path:
            sys.path.remove(abs_codebase_dir)