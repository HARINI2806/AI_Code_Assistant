# backend/visualizer/visualizer.py

import os
import ast
from typing import List, Tuple


# backend/visualizer/visualizer.py (updated Step 1)

def extract_relationships_from_file(file_path: str) -> List[Tuple[str, str]]:
    with open(file_path, "r", encoding="utf-8") as f:
        source = f.read()

    tree = ast.parse(source)
    relationships = []

    class CallVisitor(ast.NodeVisitor):
        def __init__(self):
            self.current_class = None
            self.current_func = None

        def visit_ClassDef(self, node):
            self.current_class = node.name
            for base in node.bases:
                if isinstance(base, ast.Name):
                    relationships.append((node.name, base.id))  # Inheritance
            self.generic_visit(node)
            self.current_class = None

        def visit_FunctionDef(self, node):
            if self.current_class:
                self.current_func = f"{self.current_class}.{node.name}"
            else:
                self.current_func = node.name
            self.generic_visit(node)

        def visit_Call(self, node):
            if isinstance(node.func, ast.Name):
                callee = node.func.id
            elif isinstance(node.func, ast.Attribute):
                callee = node.func.attr
            else:
                callee = None

            if self.current_func and callee:
                relationships.append((self.current_func, callee))

            self.generic_visit(node)

    visitor = CallVisitor()
    visitor.visit(tree)
    return relationships



def generate_mermaid_diagram(codebase_path: str, diagram_type: str = "flowchart") -> str:
    edges = []

    for root, _, files in os.walk(codebase_path):
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                try:
                    edges += extract_relationships_from_file(file_path)
                except Exception as e:
                    print(f"[WARN] Skipping {file_path} due to error: {e}")

    lines = []

    if diagram_type == "flowchart":
        lines.append("graph TD")
        for src, dst in edges:
            lines.append(f"    {src} --> {dst}")

    elif diagram_type == "class":
        lines.append("classDiagram")
        for src, dst in edges:
            if "." not in src and "." not in dst:
                lines.append(f"    class {src}")
                lines.append(f"    class {dst}")
                lines.append(f"    {src} <|-- {dst}")

    else:
        raise ValueError("Unsupported diagram_type: choose 'flowchart' or 'class'")

    return "\n".join(lines)

def export_mermaid_to_file(mermaid_code: str, output_path: str):
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(mermaid_code)
    print(f"[✅] Mermaid diagram saved as .mmd at: {output_path}")

    if output_path.endswith(".mmd"):
        svg_path = output_path.replace(".mmd", ".svg")
        try:
            subprocess.run(["mmdc", "-i", output_path, "-o", svg_path], check=True)
            print(f"[✅] Rendered SVG saved to: {svg_path}")
        except FileNotFoundError:
            print("[⚠️] Mermaid CLI (`mmdc`) not found. Install via `npm install -g @mermaid-js/mermaid-cli`.")