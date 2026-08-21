from io import BytesIO
from pathlib import Path


def _extract_image_text(file_bytes: bytes) -> str:
    import pytesseract
    from PIL import Image, ImageEnhance, ImageFilter, ImageOps

    tesseract_path = Path("C:/Program Files/Tesseract-OCR/tesseract.exe")
    if tesseract_path.exists():
        pytesseract.pytesseract.tesseract_cmd = str(tesseract_path)

    image = Image.open(BytesIO(file_bytes))
    image = ImageOps.exif_transpose(image).convert("RGB")
    image = image.resize((image.width * 2, image.height * 2))
    image = ImageEnhance.Contrast(image).enhance(1.5)
    image = image.filter(ImageFilter.SHARPEN)
    gray_image = ImageOps.grayscale(image)
    threshold_image = gray_image.point(lambda pixel: 0 if pixel < 180 else 255)
    passes = [
        pytesseract.image_to_string(image, config="--psm 3"),
        pytesseract.image_to_string(image, config="--psm 4"),
        pytesseract.image_to_string(gray_image, config="--psm 6"),
        pytesseract.image_to_string(threshold_image, config="--psm 11"),
    ]
    lines = []
    seen = set()
    for text in passes:
        for line in text.splitlines():
            cleaned = " ".join(line.split()).strip()
            if cleaned and cleaned.lower() not in seen:
                lines.append(cleaned)
                seen.add(cleaned.lower())
    return "\n".join(lines).strip()


def extract_resume_text(file_name: str, file_bytes: bytes) -> str:
    """Extract text from a PDF, DOCX, TXT, JPG, JPEG, or PNG resume."""
    extension = Path(file_name).suffix.lower()

    if extension in {".jpg", ".jpeg", ".png"}:
        try:
            return _extract_image_text(file_bytes)
        except ImportError as error:
            raise ValueError(
                "Image resume support requires OCR dependencies. Install them with "
                "'pip install pytesseract pillow'."
            ) from error
        except Exception as error:
            raise ValueError(
                "The image resume could not be read. Check that Tesseract OCR is installed."
            ) from error

    if extension == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(BytesIO(file_bytes))
        extracted_pages = [page.extract_text() or "" for page in reader.pages]
        if all(text.strip() for text in extracted_pages):
            return "\n".join(extracted_pages).strip()

        try:
            import fitz
            import pytesseract
            from PIL import Image

            tesseract_path = Path("C:/Program Files/Tesseract-OCR/tesseract.exe")
            if tesseract_path.exists():
                pytesseract.pytesseract.tesseract_cmd = str(tesseract_path)

            document = fitz.open(stream=file_bytes, filetype="pdf")
            pages = []
            for page_index, page in enumerate(document):
                if extracted_pages[page_index].strip():
                    pages.append(extracted_pages[page_index])
                    continue
                pixels = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                image = Image.frombytes("RGB", [pixels.width, pixels.height], pixels.samples)
                image_bytes = BytesIO()
                image.save(image_bytes, format="PNG")
                pages.append(_extract_image_text(image_bytes.getvalue()))
            return "\n".join(pages).strip()
        except ImportError as error:
            raise ValueError(
                "This PDF appears to be scanned. Install OCR dependencies with "
                "'pip install pymupdf pytesseract pillow'."
            ) from error
        except Exception as error:
            raise ValueError(
                "The scanned PDF could not be read. Install Tesseract OCR and try again."
            ) from error

    if extension == ".docx":
        from docx import Document

        document = Document(BytesIO(file_bytes))
        return "\n".join(paragraph.text for paragraph in document.paragraphs).strip()

    if extension == ".txt":
        return file_bytes.decode("utf-8", errors="ignore").strip()

    raise ValueError("Unsupported resume format. Upload a PDF, DOCX, or TXT file.")
