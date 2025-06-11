# visualizer/diagram_generator.py

import os
import ast
from pathlib import Path

MERMAID_DIR = "output/diagrams"
os.makedirs(MERMAID_DIR, exist_ok=True)

def find_python_files(codebase_path: str):
    for root, _, files in os.walk(codebase_path):
        for file in files:
            if file.endswith(".py"):
                yield os.path.join(root, file)

def extract_class_info(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read(), filename=file_path)

    classes = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            class_name = node.name
            bases = [b.id for b in node.bases if isinstance(b, ast.Name)]
            classes.append((class_name, bases))
    return classes

def extract_function_calls(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read(), filename=file_path)

    calls = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
            calls.add(f"{node.func.value.id}.{node.func.attr}") if isinstance(node.func.value, ast.Name) else None
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            calls.add(node.func.id)
    return list(calls)

def generate_class_diagram(codebase_path: str):
    classes = []
    for file in find_python_files(codebase_path):
        classes.extend(extract_class_info(file))

    mermaid = ["classDiagram"]
    for cls, bases in classes:
        mermaid.append(f"class {cls}")
        for base in bases:
            mermaid.append(f"{base} <|-- {cls}")

    output_path = os.path.join(MERMAID_DIR, "class_diagram.mmd")
    with open(output_path, "w") as f:
        f.write("\n".join(mermaid))

    return output_path

def generate_dependency_graph(codebase_path: str):
    edges = set()
    for file in find_python_files(codebase_path):
        caller = Path(file).stem
        calls = extract_function_calls(file)
        for callee in calls:
            edges.add((caller, callee))

    mermaid = ["graph TD"]
    for caller, callee in edges:
        mermaid.append(f"{caller} --> {callee}")

    output_path = os.path.join(MERMAID_DIR, "dependency_graph.mmd")
    with open(output_path, "w") as f:
        f.write("\n".join(mermaid))

    return output_path
