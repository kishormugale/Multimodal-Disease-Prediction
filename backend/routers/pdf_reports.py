"""
PDF Report Generation Router
Handles PDF export of prediction reports
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from db import get_reports_collection
from ml.pdf_generator import generate_prediction_report

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/{report_id}/pdf")
async def download_report_pdf(report_id: str):
    """
    Generate and download a PDF report for a specific prediction.
    
    Args:
        report_id: The unique ID of the report
        
    Returns:
        PDF file as downloadable response
    """
    # Fetch the report from MongoDB
    col = get_reports_collection()
    report = await col.find_one({"id": report_id}, {"_id": 0})
    
    if not report:
        raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
    
    # Convert datetime to ISO string if needed
    if "timestamp" in report and hasattr(report["timestamp"], "isoformat"):
        report["date"] = report["timestamp"].isoformat()
        report["time"] = report["timestamp"].strftime("%I:%M %p")
    
    # Add patient name if not present
    if "patientName" not in report:
        report["patientName"] = "Anonymous Patient"
    
    # Generate PDF
    try:
        pdf_bytes = generate_prediction_report(report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
    
    # Create filename
    disease_id = report.get("disease_id", "report").replace(" ", "-")
    filename = f"KDM_Care_Report_{disease_id}_{report_id[:8]}.pdf"
    
    # Return PDF as downloadable file
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "application/pdf"
        }
    )
