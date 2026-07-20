"""
OCR service — extracts text from uploaded screenshots using Tesseract.
Applies light preprocessing (grayscale + threshold) to improve accuracy
on typical WhatsApp/SMS screenshot images.
"""
import io
import pytesseract
from PIL import Image, ImageOps, ImageFilter


def extract_text(image_bytes: bytes) -> str:
    """
    Takes raw image bytes, preprocesses for better OCR accuracy,
    and returns the extracted text (stripped).
    Raises ValueError if the image can't be opened.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as exc:
        raise ValueError(f"Could not read image: {exc}") from exc

    # Preprocessing pipeline: grayscale -> autocontrast -> slight sharpen
    # This meaningfully improves OCR accuracy on compressed chat screenshots.
    processed = ImageOps.grayscale(image)
    processed = ImageOps.autocontrast(processed)
    processed = processed.filter(ImageFilter.SHARPEN)

    raw_text = pytesseract.image_to_string(processed)
    return raw_text.strip()
