import os
import asyncio
from difflib import unified_diff
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def generate_docstring(code_snippet: str, language: str) -> str:
    prompt = f"Add a high-quality docstring/comment to the following {language} code:\n\n{code_snippet}"
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()


async def process_python_file(file_path, output_path, apply_changes):
    import ast, astor
    with open(file_path, "r", encoding="utf-8") as f:
        original_code = f.read()

    tree = ast.parse(original_code)
    modified = False
    docstring_tasks = []

    class Inserter(ast.NodeTransformer):
        def visit_FunctionDef(self, node):
            if not ast.get_docstring(node):
                docstring_tasks.append((node, astor.to_source(node)))
            return self.generic_visit(node)

        def visit_ClassDef(self, node):
            if not ast.get_docstring(node):
                docstring_tasks.append((node, astor.to_source(node)))
            return self.generic_visit(node)

    Inserter().visit(tree)

    if docstring_tasks:
        modified = True
        docstrings = await asyncio.gather(
            *(generate_docstring(snippet, "Python") for _, snippet in docstring_tasks)
        )
        for (node, _), doc in zip(docstring_tasks, docstrings):
            node.body.insert(0, ast.Expr(value=ast.Str(s=doc)))

    if modified:
        updated_code = astor.to_source(tree)
        if not apply_changes:
            diff = unified_diff(
                original_code.splitlines(),
                updated_code.splitlines(),
                fromfile="original",
                tofile="updated",
                lineterm=""
            )
            return {"file": file_path, "diff": "\n".join(diff)}

        # Apply change
        rel_path = os.path.relpath(file_path)
        out_file = os.path.join(output_path, rel_path)
        os.makedirs(os.path.dirname(out_file), exist_ok=True)
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(updated_code)
        return {"file": file_path}


async def process_generic_file(file_path, output_path, apply_changes, language: str, comment_symbol: str):
    with open(file_path, "r", encoding="utf-8") as f:
        original_code = f.read()

    docstring = await generate_docstring(original_code, language)

    # Prepend comment to top of file
    docstring_block = "\n".join([f"{comment_symbol} {line}" for line in docstring.splitlines()])
    updated_code = f"{docstring_block}\n\n{original_code}"

    if not apply_changes:
        diff = unified_diff(
            original_code.splitlines(),
            updated_code.splitlines(),
            fromfile="original",
            tofile="updated",
            lineterm=""
        )
        return {"file": file_path, "diff": "\n".join(diff)}

    # Save to output
    rel_path = os.path.relpath(file_path)
    out_file = os.path.join(output_path, rel_path)
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(updated_code)

    return {"file": file_path}


async def generate_docstrings_in_codebase(codebase_path, output_path, apply_changes=True):
    tasks = []

    for root, _, files in os.walk(codebase_path):
        for file in files:
            full_path = os.path.join(root, file)
            if file.endswith(".py"):
                tasks.append(process_python_file(full_path, output_path, apply_changes))
            elif file.endswith(".js"):
                tasks.append(process_generic_file(full_path, output_path, apply_changes, "JavaScript", "//"))
            elif file.endswith(".java"):
                tasks.append(process_generic_file(full_path, output_path, apply_changes, "Java", "//"))

    return await asyncio.gather(*tasks)
