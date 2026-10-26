def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["offline_ready"] is True

def test_capabilities(client):
    response = client.get("/api/v1/system/capabilities")
    assert response.status_code == 200
    data = response.json()
    assert data["vision_enabled"] is True
    assert data["audio_vad_enabled"] is True
    assert len(data["models"]) >= 2

def test_classroom_lifecycle(client):
    # Create classroom
    res = client.post("/api/v1/classrooms", json={
        "name": "Physics 101",
        "code": "PHYS101-TEST",
        "room_number": "Lab 10",
        "capacity": 25,
    })
    assert res.status_code == 201
    classroom = res.json()
    assert classroom["code"] == "PHYS101-TEST"

    # Fetch classrooms
    list_res = client.get("/api/v1/classrooms")
    assert list_res.status_code == 200
    assert any(c["id"] == classroom["id"] for c in list_res.json())

    # Create participant
    part_res = client.post("/api/v1/participants", json={
        "classroom_id": classroom["id"],
        "code": "PAR-999",
        "name": "Test Student",
        "email": "test@student.edu",
    })
    assert part_res.status_code == 201
    participant = part_res.json()
    assert participant["code"] == "PAR-999"

    # Create and start session
    ses_res = client.post("/api/v1/sessions", json={
        "classroom_id": classroom["id"],
        "title": "Quantum Mechanics Intro",
        "presence_threshold_seconds": 30,
    })
    assert ses_res.status_code == 201
    session = ses_res.json()
    assert session["status"] == "scheduled"

    start_res = client.post(f"/api/v1/sessions/{session['id']}/start")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "active"
