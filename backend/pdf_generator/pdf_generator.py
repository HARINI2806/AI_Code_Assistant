import os
import asyncio
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from summarizer.summary_generator import generate_summaries

def generate_pdf_from_codebase(codebase_path: str, output_pdf_path: str = "output/tutorial.pdf"):
    os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
    doc = SimpleDocTemplate(output_pdf_path, pagesize=letter, leftMargin=50, rightMargin=50, topMargin=50, bottomMargin=50)
    
    styles = getSampleStyleSheet()
    title_style = styles["Title"]
    heading_style = styles["Heading2"]
    code_style = styles["Code"]
    normal_style = styles["BodyText"]

    story = []

    # 📌 Title Page
    story.append(Paragraph("📘 Codebase Summary", title_style))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(f"Path: {codebase_path}", normal_style))
    story.append(Spacer(1, 0.5 * inch))

    # ✅ Generate summaries
    summaries = asyncio.run(generate_summaries(codebase_path))

    # ✅ Build TOC and group summaries by file
    file_summary_map = {}
    for item in summaries:
        file_summary_map.setdefault(item['file'], []).append(item)

    toc_entries = []

    for file_path, chunks in file_summary_map.items():
        toc_entries.append(file_path)
        story.append(PageBreak())

        # 📄 File heading
        story.append(Paragraph(f"📁 {file_path}", heading_style))
        story.append(Spacer(1, 0.2 * inch))

        for item in chunks:
            summary_text = item["summary"].strip()
            if not summary_text:
                continue

            story.append(Paragraph(f"🔹 Chunk {item['chunk_index']}", styles["Heading4"]))
            story.append(Spacer(1, 0.1 * inch))
            story.append(Paragraph(summary_text, normal_style))
            story.append(Spacer(1, 0.2 * inch))

    # 📑 Table of Contents
    doc.build(
        [Paragraph("📑 Table of Contents", title_style)] +
        [Spacer(1, 0.2 * inch)] +
        [Paragraph(f"{i + 1}. {toc}", normal_style) for i, toc in enumerate(toc_entries)] +
        [PageBreak()] +
        story
    )
