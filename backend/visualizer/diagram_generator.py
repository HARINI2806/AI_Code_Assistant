# visualizer/diagram_generator.py

import os
import ast
import re
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Set, Tuple, Any

MERMAID_DIR = "output/diagrams"
os.makedirs(MERMAID_DIR, exist_ok=True)

def find_python_files(codebase_path: str):
    """Find all Python files in the codebase."""
    for root, _, files in os.walk(codebase_path):
        for file in files:
            if file.endswith(".py"):
                yield os.path.join(root, file)

def get_ast_tree(file_path: str):
    """Parse Python file and return AST tree."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return ast.parse(content, filename=file_path), content
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        return None, None

def _get_return_annotation(func_node):
    """Extract return type annotation from function."""
    if func_node.returns:
        if isinstance(func_node.returns, ast.Name):
            return func_node.returns.id
        elif isinstance(func_node.returns, ast.Constant):
            return str(func_node.returns.value)
    return None

def extract_detailed_class_info(file_path: str):
    """Extract detailed class information including methods and attributes."""
    tree, content = get_ast_tree(file_path)
    if not tree:
        return []
    
    classes = []
    
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            class_info = {
                'name': node.name,
                'bases': [],
                'methods': [],
                'attributes': [],
                'file': Path(file_path).stem,
                'docstring': ast.get_docstring(node) or ""
            }
            
            # Extract base classes
            for base in node.bases:
                if isinstance(base, ast.Name):
                    class_info['bases'].append(base.id)
                elif isinstance(base, ast.Attribute):
                    class_info['bases'].append(f"{base.value.id}.{base.attr}" if isinstance(base.value, ast.Name) else "Unknown")
            
            # Extract methods and attributes
            for item in node.body:
                if isinstance(item, ast.FunctionDef):
                    method_info = {
                        'name': item.name,
                        'args': [arg.arg for arg in item.args.args],
                        'is_private': item.name.startswith('_'),
                        'is_static': any(isinstance(d, ast.Name) and d.id == 'staticmethod' for d in item.decorator_list),
                        'is_class': any(isinstance(d, ast.Name) and d.id == 'classmethod' for d in item.decorator_list),
                        'returns': _get_return_annotation(item)
                    }
                    class_info['methods'].append(method_info)
                elif isinstance(item, ast.Assign):
                    for target in item.targets:
                        if isinstance(target, ast.Name):
                            class_info['attributes'].append({
                                'name': target.id,
                                'is_private': target.id.startswith('_')
                            })
            
            classes.append(class_info)
    
    return classes

def extract_imports_and_dependencies(file_path: str):
    """Extract imports and function calls for dependency analysis."""
    tree, _ = get_ast_tree(file_path)
    if not tree:
        return [], []
    
    imports = []
    function_calls = []
    
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            for alias in node.names:
                imports.append(f"{module}.{alias.name}" if module else alias.name)
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                function_calls.append(node.func.id)
            elif isinstance(node.func, ast.Attribute):
                if isinstance(node.func.value, ast.Name):
                    function_calls.append(f"{node.func.value.id}.{node.func.attr}")
    
    return imports, function_calls

def extract_complexity_metrics(file_path: str):
    """Extract complexity metrics from Python file."""
    tree, content = get_ast_tree(file_path)
    if not tree:
        return {}
    
    metrics = {
        'lines_of_code': len(content.splitlines()),
        'num_classes': 0,
        'num_functions': 0,
        'cyclomatic_complexity': 0,
        'max_nesting_depth': 0
    }
    
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            metrics['num_classes'] += 1
        elif isinstance(node, ast.FunctionDef):
            metrics['num_functions'] += 1
            # Simple cyclomatic complexity calculation
            complexity = 1  # Base complexity
            for child in ast.walk(node):
                if isinstance(child, (ast.If, ast.While, ast.For, ast.Try, ast.With)):
                    complexity += 1
                elif isinstance(child, ast.BoolOp):
                    complexity += len(child.values) - 1
            metrics['cyclomatic_complexity'] += complexity
    
    return metrics

def generate_enhanced_class_diagram(codebase_path: str):
    """Generate detailed class diagram with methods and attributes."""
    all_classes = []
    for file in find_python_files(codebase_path):
        all_classes.extend(extract_detailed_class_info(file))
    
    mermaid = ["classDiagram"]
    
    # Add class definitions with methods and attributes
    for cls in all_classes:
        class_name = cls['name']
        
        # Define class
        mermaid.append(f"    class {class_name} {{")
        
        # Add attributes
        for attr in cls['attributes']:
            visibility = "-" if attr['is_private'] else "+"
            mermaid.append(f"        {visibility}{attr['name']}")
        
        if cls['attributes'] and cls['methods']:
            mermaid.append("        ----")  # Separator line
        
        # Add methods
        for method in cls['methods']:
            if method['is_static']:
                visibility = "+"
                method_name = f"<<static>> {method['name']}()"
            elif method['is_class']:
                visibility = "+"
                method_name = f"<<class>> {method['name']}()"
            elif method['is_private']:
                visibility = "-"
                method_name = f"{method['name']}()"
            else:
                visibility = "+"
                method_name = f"{method['name']}()"
            
            if method['returns']:
                method_name += f" : {method['returns']}"
            
            mermaid.append(f"        {visibility}{method_name}")
        
        mermaid.append("    }")
        
        # Add inheritance relationships
        for base in cls['bases']:
            mermaid.append(f"    {base} <|-- {class_name}")
    
    output_path = os.path.join(MERMAID_DIR, "enhanced_class_diagram.mmd")
    with open(output_path, "w") as f:
        f.write("\n".join(mermaid))
    
    return output_path

def generate_module_dependency_graph(codebase_path: str):
    """Generate module-level dependency graph."""
    module_dependencies = defaultdict(set)
    
    for file in find_python_files(codebase_path):
        module_name = Path(file).stem
        imports, _ = extract_imports_and_dependencies(file)
        
        for imp in imports:
            # Filter for internal dependencies (modules in the same codebase)
            if not imp.startswith(('os', 'sys', 'json', 'datetime', 'collections', 're', 'pathlib')):
                base_module = imp.split('.')[0]
                if base_module != module_name:
                    module_dependencies[module_name].add(base_module)
    
    mermaid = ["graph TD"]
    for module, deps in module_dependencies.items():
        for dep in deps:
            mermaid.append(f"    {module} --> {dep}")
    
    output_path = os.path.join(MERMAID_DIR, "module_dependency_graph.mmd")
    with open(output_path, "w") as f:
        f.write("\n".join(mermaid))
    
    return output_path

def generate_call_flow_diagram(codebase_path: str):
    """Generate function call flow diagram."""
    call_relationships = defaultdict(set)
    
    for file in find_python_files(codebase_path):
        tree, _ = get_ast_tree(file)
        if not tree:
            continue
        
        current_function = None
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                current_function = node.name
            elif isinstance(node, ast.Call) and current_function:
                if isinstance(node.func, ast.Name):
                    call_relationships[current_function].add(node.func.id)
                elif isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name):
                    call_relationships[current_function].add(f"{node.func.value.id}.{node.func.attr}")
    
    mermaid = ["flowchart TD"]
    for caller, callees in call_relationships.items():
        for callee in callees:
            # Sanitize names for Mermaid
            clean_caller = re.sub(r'[^a-zA-Z0-9_]', '_', caller)
            clean_callee = re.sub(r'[^a-zA-Z0-9_]', '_', callee)
            mermaid.append(f"    {clean_caller}[{caller}] --> {clean_callee}[{callee}]")
    
    output_path = os.path.join(MERMAID_DIR, "call_flow_diagram.mmd")
    with open(output_path, "w") as f:
        f.write("\n".join(mermaid))
    
    return output_path

def generate_complexity_heatmap(codebase_path: str):
    """Generate complexity heatmap diagram."""
    file_metrics = {}
    
    for file in find_python_files(codebase_path):
        module_name = Path(file).stem
        metrics = extract_complexity_metrics(file)
        file_metrics[module_name] = metrics
    
    # Create a simple visual representation of complexity
    mermaid = ["graph TB"]
    mermaid.append("    subgraph Legend")
    mermaid.append("        L1[Low Complexity < 50 LOC]")
    mermaid.append("        L2[Medium Complexity 50-200 LOC]")
    mermaid.append("        L3[High Complexity > 200 LOC]")
    mermaid.append("    end")
    
    for module, metrics in file_metrics.items():
        loc = metrics['lines_of_code']
        complexity = metrics['cyclomatic_complexity']
        
        if loc < 50:
            color_class = ":::low"
            mermaid.append(f"    {module}[{module}<br/>LOC: {loc}<br/>CC: {complexity}]{color_class}")
        elif loc < 200:
            color_class = ":::medium"
            mermaid.append(f"    {module}[{module}<br/>LOC: {loc}<br/>CC: {complexity}]{color_class}")
        else:
            color_class = ":::high"
            mermaid.append(f"    {module}[{module}<br/>LOC: {loc}<br/>CC: {complexity}]{color_class}")
    
    # Add styling
    mermaid.extend([
        "    classDef low fill:#90EE90",
        "    classDef medium fill:#FFD700", 
        "    classDef high fill:#FF6B6B"
    ])
    
    output_path = os.path.join(MERMAID_DIR, "complexity_heatmap.mmd")
    with open(output_path, "w") as f:
        f.write("\n".join(mermaid))
    
    return output_path

def generate_package_structure_diagram(codebase_path: str):
    """Generate package/directory structure diagram."""
    structure = defaultdict(list)
    
    for file in find_python_files(codebase_path):
        rel_path = os.path.relpath(file, codebase_path)
        parts = Path(rel_path).parts
        
        if len(parts) > 1:
            package = parts[0]
            module = Path(parts[-1]).stem
            structure[package].append(module)
        else:
            structure['root'].append(Path(parts[0]).stem)
    
    mermaid = ["graph TD"]
    mermaid.append("    Root[Project Root]")
    
    for package, modules in structure.items():
        if package == 'root':
            for module in modules:
                mermaid.append(f"    Root --> {module}[{module}.py]")
        else:
            package_node = f"PKG_{package}"
            mermaid.append(f"    Root --> {package_node}[{package}/]")
            for module in modules:
                module_node = f"{package}_{module}"
                mermaid.append(f"    {package_node} --> {module_node}[{module}.py]")
    
    output_path = os.path.join(MERMAID_DIR, "package_structure.mmd")
    with open(output_path, "w") as f:
        f.write("\n".join(mermaid))
    
    return output_path

# Maintain backward compatibility
def generate_class_diagram(codebase_path: str):
    """Legacy function - redirects to enhanced version."""
    return generate_enhanced_class_diagram(codebase_path)

def generate_dependency_graph(codebase_path: str):
    """Legacy function - redirects to module dependency version."""
    return generate_module_dependency_graph(codebase_path)