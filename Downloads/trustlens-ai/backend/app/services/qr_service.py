"""
QR code decoding service — uses OpenCV to load the image and pyzbar
to decode any QR codes found, returning the embedded payload (usually a URL).
"""
import numpy as np
import cv2
from pyzbar.pyzbar import decode


def decode_qr(image_bytes: bytes) -> str | None:
    """
    Decodes the first QR code found in the uploaded image.
    Returns the decoded payload string, or None if no QR code is found.
    Raises ValueError if the image bytes can't be decoded as an image.
    """
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Uploaded file is not a readable image")

    decoded_objects = decode(img)
    if not decoded_objects:
        # Retry on a grayscale + thresholded version — helps with low-contrast QR photos
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        decoded_objects = decode(thresh)

    if not decoded_objects:
        return None

    return decoded_objects[0].data.decode("utf-8", errors="ignore")
