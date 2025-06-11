# pdf_generator/pdf_generator.py

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import inch

from summarizer.summary_generator import generate_summaries

DEFAULT_CODEBASE_PATH = "./sample-codebase"
PDF_OUTPUT_PATH = "output/codebase_summary.pdf"

# Custom styles
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleCenter", parent=styles["Heading1"], alignment=TA_CENTER, fontSize=20))
styles.add(ParagraphStyle(name="FileSubtitle", parent=styles["Heading2"], textColor="blue", fontSize=14))
styles.add(ParagraphStyle(name="NormalText", parent=styles["BodyText"], fontSize=11, leading=14))

def build_toc(summaries: str):
    lines = summaries.splitlines()
    toc = ["Table of Contents", ""]
    for line in lines:
        if line.strip().startswith("### Summary for"):
            toc.append(line.strip())
    return toc

async def generate_pdf_from_codebase(codebase_path: str = DEFAULT_CODEBASE_PATH) -> str:
    summaries = await generate_summaries(codebase_path)
    if not summaries.strip():
        raise ValueError("No summaries generated.")

    doc = SimpleDocTemplate(PDF_OUTPUT_PATH, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    content = []

    # Title page
    content.append(Paragraph("Codebase Tutorial Summary", styles["TitleCenter"]))
    content.append(Spacer(1, 0.3 * inch))

    # Table of Contents
    toc_lines = build_toc(summaries)
    for line in toc_lines:
        content.append(Paragraph(line, styles["NormalText"]))
    content.append(PageBreak())

    # Body
    for line in summaries.splitlines():
        if line.startswith("# "):
            content.append(Paragraph(line[2:], styles["TitleCenter"]))
        elif line.startswith("### Summary for"):
            content.append(PageBreak())
            content.append(Paragraph(line.replace("###", "").strip(), styles["FileSubtitle"]))
            content.append(Spacer(1, 0.2 * inch))
        elif line.startswith("- "):
            content.append(Paragraph(line, styles["NormalText"]))
            content.append(Spacer(1, 0.1 * inch))
        elif line.strip():
            content.append(Paragraph(line, styles["NormalText"]))
        else:
            content.append(Spacer(1, 0.1 * inch))

    doc.build(content)
    return PDF_OUTPUT_PATH
