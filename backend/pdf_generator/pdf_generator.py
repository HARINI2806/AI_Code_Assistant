from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import black, grey, darkblue, lightgrey
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, NextPageTemplate, PageTemplate, Frame
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib import colors
from datetime import datetime
import os
from summarizer.summary_generator import generate_summaries
DEFAULT_CODEBASE_PATH = "./sample-codebase"
PDF_OUTPUT_PATH = "output/codebase_summary.pdf"
class NumberedCanvas:
    """Custom canvas for adding page numbers and headers/footers"""
    def __init__(self, canvas, doc):
        self.canvas = canvas
        self.doc = doc
        
    def draw_page_number(self):
        """Draw page number at bottom center"""
        page_num = self.canvas.getPageNumber()
        text = f"Page {page_num}"
        self.canvas.setFont("Helvetica", 10)
        self.canvas.setFillColor(grey)
        self.canvas.drawCentredString(A4[0] / 2, 0.75 * inch, text)
        
    def draw_header(self):
        """Draw header with document title"""
        if self.canvas.getPageNumber() > 1:  # Skip header on title page
            self.canvas.setFont("Helvetica", 9)
            self.canvas.setFillColor(grey)
            self.canvas.drawString(72, A4[1] - 50, "Codebase Tutorial Summary")
            # Draw a line under header
            self.canvas.setStrokeColor(lightgrey)
            self.canvas.setLineWidth(0.5)
            self.canvas.line(72, A4[1] - 55, A4[0] - 72, A4[1] - 55)

def create_enhanced_styles():
    """Create enhanced paragraph styles for better formatting"""
    styles = getSampleStyleSheet()
    
    # Enhanced title style
    styles.add(ParagraphStyle(
        name='EnhancedTitle',
        parent=styles['Title'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=darkblue,
        fontName='Helvetica-Bold'
    ))
    
    # Subtitle style
    styles.add(ParagraphStyle(
        name='Subtitle',
        parent=styles['Normal'],
        fontSize=16,
        spaceAfter=20,
        spaceBefore=10,
        alignment=TA_CENTER,
        textColor=black,
        fontName='Helvetica-Bold'
    ))
    
    # Section header style
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=12,
        spaceBefore=20,
        textColor=darkblue,
        fontName='Helvetica-Bold',
        keepWithNext=1
    ))
    
    # File header style
    styles.add(ParagraphStyle(
        name='FileHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=10,
        spaceBefore=15,
        textColor=black,
        fontName='Helvetica-Bold',
        keepWithNext=1,
        backColor=lightgrey,
        borderPadding=8,
        borderWidth=1,
        borderColor=grey
    ))
    
    # Enhanced body text
    styles.add(ParagraphStyle(
        name='EnhancedBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        spaceBefore=3,
        alignment=TA_JUSTIFY,
        fontName='Helvetica',
        leading=14
    ))
    
    # Bullet point style
    styles.add(ParagraphStyle(
        name='BulletPoint',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=4,
        spaceBefore=2,
        leftIndent=20,
        bulletIndent=10,
        fontName='Helvetica',
        leading=13
    ))
    
    # TOC styles
    styles.add(ParagraphStyle(
        name='TOCHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        spaceBefore=0,
        textColor=darkblue,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='TOCEntry',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=4,
        leftIndent=0,
        fontName='Helvetica'
    ))
    
    # Code style for file paths
    styles.add(ParagraphStyle(
        name='CodePath',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Courier',
        textColor=darkblue,
        backColor=lightgrey,
        borderPadding=4
    ))
    
    return styles

def create_title_page_content():
    """Create professional title page content"""
    styles = create_enhanced_styles()
    content = []
    
    # Add some top spacing
    content.append(Spacer(1, 2 * inch))
    
    # Main title
    content.append(Paragraph("Codebase Tutorial Summary", styles["EnhancedTitle"]))
    content.append(Spacer(1, 0.5 * inch))
    
    # Subtitle
    content.append(Paragraph("Comprehensive Analysis and Documentation", styles["Subtitle"]))
    content.append(Spacer(1, 1.5 * inch))
    
    # Generate metadata table
    metadata = [
        ["Generated On:", datetime.now().strftime("%B %d, %Y at %I:%M %p")],
        ["Document Type:", "Technical Documentation"],
        ["Format:", "PDF Report"]
    ]
    
    metadata_table = Table(metadata, colWidths=[2*inch, 3*inch])
    metadata_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    content.append(metadata_table)
    content.append(PageBreak())
    
    return content

def build_enhanced_toc(summaries: str):
    """Build an enhanced table of contents with page references"""
    styles = create_enhanced_styles()
    content = []
    
    # TOC Title
    content.append(Paragraph("Table of Contents", styles["TOCHeading"]))
    content.append(Spacer(1, 0.3 * inch))
    
    # Parse summaries to build TOC
    toc_entries = []
    current_section = None
    
    for line in summaries.splitlines():
        if line.startswith("# "):
            current_section = line[2:].strip()
            toc_entries.append(("section", current_section))
        elif line.startswith("### Summary for"):
            file_name = line.replace("### Summary for", "").strip()
            toc_entries.append(("file", file_name))
    
    # Create TOC table
    toc_data = []
    for entry_type, entry_text in toc_entries:
        if entry_type == "section":
            toc_data.append([entry_text, ""])  # Page numbers would be added by reportlab TOC
        else:
            toc_data.append([f"  • {entry_text}", ""])
    
    if toc_data:
        toc_table = Table(toc_data, colWidths=[5*inch, 1*inch])
        toc_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        content.append(toc_table)
    
    content.append(PageBreak())
    return content

def process_content_with_enhanced_formatting(summaries: str):
    """Process content with enhanced formatting and proper pagination"""
    styles = create_enhanced_styles()
    content = []
    
    lines = summaries.splitlines()
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        if not line:
            content.append(Spacer(1, 6))
            i += 1
            continue
        
        if line.startswith("# "):
            # Major section header
            section_content = []
            section_content.append(Paragraph(line[2:], styles["SectionHeader"]))
            section_content.append(Spacer(1, 12))
            content.append(KeepTogether(section_content))
            
        elif line.startswith("### Summary for"):
            # File header - create a new section
            file_name = line.replace("### Summary for", "").strip()
            
            # Group file header with its content
            file_section = []
            file_section.append(Spacer(1, 12))
            file_section.append(Paragraph(f"File: {file_name}", styles["FileHeader"]))
            
            # Look ahead to collect file content
            j = i + 1
            file_content = []
            while j < len(lines) and not lines[j].startswith("### Summary for") and not lines[j].startswith("# "):
                content_line = lines[j].strip()
                if content_line:
                    if content_line.startswith("- "):
                        file_content.append(Paragraph(content_line, styles["BulletPoint"]))
                    else:
                        file_content.append(Paragraph(content_line, styles["EnhancedBody"]))
                    file_content.append(Spacer(1, 3))
                j += 1
            
            file_section.extend(file_content)
            file_section.append(Spacer(1, 12))
            
            # Keep file sections together when possible
            content.append(KeepTogether(file_section))
            i = j - 1  # Skip processed lines
            
        elif line.startswith("- "):
            # Bullet point
            content.append(Paragraph(line, styles["BulletPoint"]))
            
        else:
            # Regular paragraph
            content.append(Paragraph(line, styles["EnhancedBody"]))
        
        i += 1
    
    return content

def on_first_page(canvas, doc):
    """Header/footer for first page (title page)"""
    # Only draw footer on title page
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(grey)
    canvas.drawCentredString(A4[0] / 2, 0.75 * inch, "Generated by Codebase Analyzer")

def on_later_pages(canvas, doc):
    """Header/footer for subsequent pages"""
    # Draw header
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(grey)
    canvas.drawString(72, A4[1] - 50, "Codebase Tutorial Summary")
    
    # Draw header line
    canvas.setStrokeColor(lightgrey)
    canvas.setLineWidth(0.5)
    canvas.line(72, A4[1] - 55, A4[0] - 72, A4[1] - 55)
    
    # Draw page number
    page_num = canvas.getPageNumber()
    canvas.drawCentredString(A4[0] / 2, 0.75 * inch, f"Page {page_num}")
    
    # Draw footer line
    canvas.line(72, inch, A4[0] - 72, inch)

async def generate_pdf_from_codebase(codebase_path: str = DEFAULT_CODEBASE_PATH) -> str:
    """Generate enhanced PDF with professional formatting, pagination, and alignment"""
    
    # Generate summaries
    summaries = await generate_summaries(codebase_path)
    if not summaries.strip():
        raise ValueError("No summaries generated.")
    
    # Create document with enhanced margins and settings
    doc = SimpleDocTemplate(
        PDF_OUTPUT_PATH,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=90,  # Increased for header
        bottomMargin=90,  # Increased for footer
        title="Codebase Tutorial Summary",
        author="Codebase Analyzer"
    )
    
    # Build content sections
    content = []
    
    # 1. Title page
    content.extend(create_title_page_content())
    
    # 2. Table of contents
    content.extend(build_enhanced_toc(summaries))
    
    # 3. Main content with enhanced formatting
    content.extend(process_content_with_enhanced_formatting(summaries))
    
    # Build PDF with custom page templates
    try:
        doc.build(
            content,
            onFirstPage=on_first_page,
            onLaterPages=on_later_pages
        )
        
        print(f"Enhanced PDF generated successfully: {PDF_OUTPUT_PATH}")
        print(f"Total pages: {doc.page}")
        
    except Exception as e:
        raise RuntimeError(f"Failed to generate PDF: {str(e)}")
    
    return PDF_OUTPUT_PATH

# Additional utility function for custom page breaks
def add_section_break():
    """Add a section break with proper spacing"""
    return [
        Spacer(1, 0.2 * inch),
        PageBreak()
    ]

# Function to estimate content length for better pagination
def should_keep_together(content_lines: list, max_lines: int = 10) -> bool:
    """Determine if content should be kept together on same page"""
    return len(content_lines) <= max_lines