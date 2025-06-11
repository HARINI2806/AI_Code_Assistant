from fastapi import APIRouter, UploadFile, File
from typing import Optional
from embedder.embedder import embed_codebase
import tempfile
import shutil
import os

router = APIRouter()


@router.post("/embed")
async def embed_codebase_route(zip_file: Optional[UploadFile] = File(None)):
    """
    Create vector embeddings from a zipped codebase or fallback to ./sample-codebase.
    """
    try:
        if zip_file:
            # Handle uploaded ZIP
            with tempfile.TemporaryDirectory() as tmp_dir:
                zip_path = os.path.join(tmp_dir, "codebase.zip")
                with open(zip_path, "wb") as f:
                    f.write(await zip_file.read())
                shutil.unpack_archive(zip_path, tmp_dir)

                embed_codebase(tmp_dir)
        else:
            # Use local folder
            local_path = "./sample-codebase"
            if not os.path.exists(local_path):
                return {"error": "sample-codebase directory not found"}
            embed_codebase(local_path)

        return {"message": "Embeddings created successfully"}

    except Exception as e:
        return {"error": str(e)}
