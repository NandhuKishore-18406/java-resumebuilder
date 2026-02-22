from fastapi import FastAPI, UploadFile, File 
from pdf2image import convert_from_bytes
import pytesseract
from PIL import Image 
import io
import re

pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

app = FastAPI()


def extract_structured_data(text: str):
    name = None
    course = None
    branch = None
    year = None

    if "software systems" in text.lower():
        branch = "Software Systems"

    if "m.sc" in text.lower():
        course = "M.Sc"

    year_match = re.search(r"\b(20\d{2})\b" , text)
    if year_match:
        year = year_match.group(0)

    name_match = re.search(r"This is to certify that\s+([A-Z\s]+)",text)

    if name_match:
        name = name_match.group(1).strip()
        name = name.title()

    return {
        "name" : name,
        "course" : course,
        "branch" : branch,
        "year": year
    }

@app.post("/parse_application")

async def parse_certificate(file: UploadFile = File(...)):

    content = await file.read()
    extracted_text = ""

    filename = file.filename.lower() if file.filename else ""
    if filename.endswith(".pdf"):
        images = convert_from_bytes(content)

        for image in images:
            extracted_text += pytesseract.image_to_string(image)

    else:
        image = Image.open(io.BytesIO(content))
        extracted_text = pytesseract.image_to_string(image)

    structured_data = extract_structured_data(extracted_text)

    return{
        "raw_text": extracted_text,
        "structured": structured_data
    }