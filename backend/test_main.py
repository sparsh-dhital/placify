from fastapi.testclient import TestClient
from main import app

# Create a test client that simulates a browser talking to our API
client = TestClient(app)

def test_read_root():
    response = client.get("/")
    # Check that the server successfully responds
    assert response.status_code == 200
    # Check that the response matches our exact baseline data
    assert response.json() == {"status": "Baseline API is running", "message": "Ready for Hackathon"}