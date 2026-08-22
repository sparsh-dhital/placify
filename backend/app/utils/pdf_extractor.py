from pathlib import Path


def extract_text_from_bytes(data: bytes, filename: str = "") -> str:
	"""Extract plain text where possible; PDF parsing remains optional for the demo."""
	if not data:
		return ""
	if Path(filename).suffix.lower() in {".txt", ".md", ".csv"} or not filename.lower().endswith(".pdf"):
		return data.decode("utf-8", errors="ignore")
	try:
		from pypdf import PdfReader
		import io
		return "\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(data)).pages)
	except ImportError:
		return data.decode("utf-8", errors="ignore")
