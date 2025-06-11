# backend/embeddings/loader.py

import os
from typing import List

SUPPORTED_EXTENSIONS = {".py", ".js", ".java"}

def load_code_files(root_dir: str) -> List[str]:
    code_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if any(filename.endswith(ext) for ext in SUPPORTED_EXTENSIONS):
                full_path = os.path.join(dirpath, filename)
                code_files.append(full_path)
    return code_files
