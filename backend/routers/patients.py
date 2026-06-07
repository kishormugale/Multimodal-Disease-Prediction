import random
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from db import get_patients_collection

router = APIRouter(prefix="/api/patients", tags=["patients"])


class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    status: str = "Admitted"


class PatientResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    status: str
    lastVisit: str


def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


@router.get("", response_model=list[PatientResponse])
async def get_patients():
    col = get_patients_collection()
    patients = await col.find({}, {"_id": 0}).to_list(length=1000)
    return patients


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(body: PatientCreate):
    new_patient = {
        "id": f"PT-{random.randint(10000, 99999)}",
        "name": body.name,
        "age": body.age,
        "gender": body.gender,
        "status": body.status,
        "lastVisit": "Just now",
    }
    col = get_patients_collection()
    await col.insert_one(new_patient)
    new_patient.pop("_id", None)
    return new_patient
