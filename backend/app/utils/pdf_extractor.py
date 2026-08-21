from pathlib import Path
import shutil


class ResumeParseError(Exception):
	pass


def _configure_tesseract(pytesseract) -> None:
	if shutil.which("tesseract"):
		return
	for candidate in (
		Path("C:/Program Files/Tesseract-OCR/tesseract.exe"),
		Path("C:/Program Files (x86)/Tesseract-OCR/tesseract.exe"),
	):
		if candidate.exists():
			pytesseract.pytesseract.tesseract_cmd = str(candidate)
			return


def extract_text(filename: str, content: bytes) -> str:
	extension = Path(filename).suffix.lower()
	try:
		if extension == ".pdf":
			import fitz

			text = "\n".join(page.get_text() for page in fitz.open(stream=content, filetype="pdf"))
			if text.strip():
				return text
			import pytesseract
			from PIL import Image

			_configure_tesseract(pytesseract)
			document = fitz.open(stream=content, filetype="pdf")
			return "\n".join(pytesseract.image_to_string(Image.frombytes("RGB", [pix.width, pix.height], pix.samples)) for page in document for pix in [page.get_pixmap()])
		if extension == ".docx":
			from docx import Document

			return "\n".join(paragraph.text for paragraph in Document(__import__("io").BytesIO(content)).paragraphs)
		if extension == ".txt":
			return content.decode("utf-8")
		if extension in {".jpg", ".jpeg", ".png"}:
			import pytesseract
			from PIL import Image

			try:
				_configure_tesseract(pytesseract)
				return pytesseract.image_to_string(Image.open(__import__("io").BytesIO(content)))
			except pytesseract.pytesseract.TesseractNotFoundError as exc:
				raise ResumeParseError(
					"Image resumes require the Tesseract OCR executable. Install Tesseract and add it to PATH, or upload a PDF, DOCX, or TXT resume."
				) from exc
	except ResumeParseError:
		raise
	except Exception as exc:
		raise ResumeParseError(f"Could not read {filename}: {exc}") from exc
	raise ResumeParseError("Unsupported resume format. Use PDF, DOCX, TXT, JPG, or PNG.")
