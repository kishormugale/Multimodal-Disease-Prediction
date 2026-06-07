"""
PDF Report Generator for KDM Care Hospital
Generates professional medical prediction reports
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
from datetime import datetime
import io


def generate_prediction_report(report_data: dict) -> bytes:
    """
    Generate a PDF report for a medical prediction.
    
    Args:
        report_data: Dictionary containing report information
        
    Returns:
        bytes: PDF file content
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1976D2'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1976D2'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=12,
        leading=14
    )
    
    # Header
    header = Paragraph("KDM CARE HOSPITAL", title_style)
    elements.append(header)
    
    subtitle = Paragraph("AI-Assisted Medical Prediction Report", 
                        ParagraphStyle('subtitle', parent=styles['Normal'], 
                                     fontSize=12, alignment=TA_CENTER,
                                     textColor=colors.grey))
    elements.append(subtitle)
    elements.append(Spacer(1, 0.3*inch))
    
    # Report Information Box
    report_info_data = [
        ['Report ID:', report_data.get('id', 'N/A')],
        ['Generated:', datetime.fromisoformat(report_data.get('date', datetime.now().isoformat())).strftime('%B %d, %Y at %I:%M %p')],
        ['Patient:', report_data.get('patientName', 'Anonymous Patient')],
    ]
    
    if report_data.get('patient_id'):
        report_info_data.append(['Patient ID:', report_data.get('patient_id')])
    
    report_info_table = Table(report_info_data, colWidths=[2*inch, 4*inch])
    report_info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E3F2FD')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(report_info_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Disease Analysis Section
    elements.append(Paragraph("DISEASE ANALYSIS", heading_style))
    
    disease_data = [
        ['Disease Target:', report_data.get('disease', 'N/A')],
        ['Disease ID:', report_data.get('disease_id', 'N/A')],
    ]
    
    disease_table = Table(disease_data, colWidths=[2*inch, 4*inch])
    disease_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#FFF3E0')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(disease_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Prediction Results Section
    elements.append(Paragraph("PREDICTION RESULTS", heading_style))
    
    # Determine risk color
    risk = report_data.get('risk', 'Low')
    risk_colors = {
        'High': colors.HexColor('#D32F2F'),
        'Medium': colors.HexColor('#F57C00'),
        'Low': colors.HexColor('#388E3C')
    }
    risk_color = risk_colors.get(risk, colors.grey)
    
    result_data = [
        ['Result:', report_data.get('result', 'N/A')],
        ['Confidence Score:', f"{report_data.get('confidence', 0):.1f}%"],
        ['Risk Level:', risk],
    ]
    
    result_table = Table(result_data, colWidths=[2*inch, 4*inch])
    result_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8F5E9')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('TEXTCOLOR', (1, 2), (1, 2), risk_color),  # Risk level color
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, 1), 'Helvetica'),
        ('FONTNAME', (1, 2), (1, 2), 'Helvetica-Bold'),  # Risk level bold
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTSIZE', (1, 2), (1, 2), 12),  # Risk level larger
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(result_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Medical Suggestion Section
    elements.append(Paragraph("MEDICAL RECOMMENDATION", heading_style))
    
    suggestion_text = report_data.get('suggestion', 'No specific recommendations at this time.')
    suggestion_para = Paragraph(suggestion_text, normal_style)
    
    suggestion_frame = Table([[suggestion_para]], colWidths=[6*inch])
    suggestion_frame.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFF9C4')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#FBC02D')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    
    elements.append(suggestion_frame)
    elements.append(Spacer(1, 0.5*inch))
    
    # Disclaimer
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER,
        leading=10
    )
    
    disclaimer_text = """
    <b>IMPORTANT DISCLAIMER:</b><br/>
    This report is generated by an AI-assisted diagnostic system and should be used as a supplementary tool only. 
    All predictions must be reviewed and validated by qualified medical professionals. 
    This report does not constitute a medical diagnosis and should not be used as the sole basis for treatment decisions.
    """
    
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph(disclaimer_text, disclaimer_style))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#1976D2'),
        alignment=TA_CENTER,
        spaceAfter=6
    )
    
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph("KDM Care Hospital - AI Multimodal Disease Prediction System", footer_style))
    elements.append(Paragraph("Confidential Medical Report", 
                             ParagraphStyle('subfooter', parent=footer_style, 
                                          fontSize=8, textColor=colors.grey)))
    
    # Build PDF
    doc.build(elements)
    
    # Get the value of the BytesIO buffer
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
