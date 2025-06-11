# backend/summarizer/pdf_generator.py

import os
from typing import List
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from dotenv import load_dotenv
from datetime import datetime

from embeddings.loader import load_code_files
from embeddings.chunker import chunk_code
from summarizer.summary_generator import generate_summaries

load_dotenv()


def generate_pdf_with_toc(output_path: str, title: str, toc: List[str], author: str = "AI Assistant", desc: str = ""):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    # Front page
    c.setFont("Helvetica-Bold", 20)
    c.drawString(1 * inch, height - 1.5 * inch, title)

    c.setFont("Helvetica", 12)
    c.drawString(1 * inch, height - 2 * inch, f"Author: {author}")
    c.drawString(1 * inch, height - 2.3 * inch, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    c.drawString(1 * inch, height - 2.6 * inch, f"Description: {desc}")
    c.showPage()

    # Table of Contents
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1 * inch, height - 1 * inch, "Table of Contents")
    c.setFont("Helvetica", 12)

    y = height - 1.5 * inch
    for i, title in enumerate(toc, start=1):
        c.drawString(1 * inch, y, f"Chapter {i}: {title}")
        y -= 0.3 * inch
        if y < 1 * inch:
            c.showPage()
            y = height - 1.5 * inch

    c.showPage()
    return c


def generate_pdf_from_codebase(codebase_path: str, output_path: str = "./tutorial.pdf"):
    code_files = load_code_files(codebase_path)
    all_chunks = []

    print(f"[🔍] Found {len(code_files)} code files. Chunking...")

    for file_path in code_files:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                chunks = chunk_code(content)
                all_chunks.extend(chunks)
        except Exception as e:
            print(f"[⚠️] Error reading {file_path}: {e}")

    print(f"[✂️] Created {len(all_chunks)} chunks. Generating summaries...")

    title = f"Codebase Tutorial: {os.path.basename(codebase_path)}"
    toc = [f"Summary for chunk {i+1}" for i in range(len(all_chunks))]

    c = generate_pdf_with_toc(output_path, title, toc, desc="AI-generated walkthrough of the codebase.")

    width, height = A4
    text_object = c.beginText(1 * inch, height - 1.2 * inch)
    text_object.setFont("Helvetica", 12)
    text_object.setLeading(16)

    for i, chunk in enumerate(all_chunks):
        print(f"  ↳ Summarizing chunk {i+1}/{len(all_chunks)}")
        summary = generate_summaries(chunk)

        text_object.textLine(f"Chapter {i+1}")
        text_object.textLine("-" * 20)
        for line in summary.strip().split("\n"):
            text_object.textLine(line)
        text_object.textLine("\n\n")

        c.drawText(text_object)
        c.showPage()
        text_object = c.beginText(1 * inch, height - 1.2 * inch)
        text_object.setFont("Helvetica", 12)
        text_object.setLeading(16)

    c.save()
    print(f"[✅] PDF with TOC saved to: {output_path}")
