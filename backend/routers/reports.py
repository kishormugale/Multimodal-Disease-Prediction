from fastapi import APIRouter
from db import get_reports_collection, get_patients_collection
from datetime import datetime

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("")
async def get_reports():
    reports_col = get_reports_collection()
    patients_col = get_patients_collection()
    
    reports = await reports_col.find({}, {"_id": 0}).sort("timestamp", -1).to_list(length=1000)
    
    # Fetch all patients for lookup
    patients = await patients_col.find({}, {"_id": 0}).to_list(length=1000)
    patient_map = {p["id"]: p for p in patients}
    
    # Enrich reports with patient data and format for frontend
    for r in reports:
        # Get patient name
        if r.get("patient_id") and r["patient_id"] in patient_map:
            r["patientName"] = patient_map[r["patient_id"]]["name"]
        else:
            r["patientName"] = "Anonymous Patient"
        
        # Format timestamp
        if "timestamp" in r:
            if isinstance(r["timestamp"], str):
                dt = datetime.fromisoformat(r["timestamp"].replace("Z", "+00:00"))
            else:
                dt = r["timestamp"]
            
            r["date"] = dt.isoformat()
            r["time"] = dt.strftime("%I:%M %p")
            r["timestamp"] = dt.isoformat()
    
    return reports
