def test_sustained_presence_and_unverified_handling(client):
    # Setup classroom and session
    cls_res = client.post("/api/v1/classrooms", json={
        "name": "Chemistry 101",
        "code": "CHEM101-TEST",
    })
    cls_id = cls_res.json()["id"]

    ses_res = client.post("/api/v1/sessions", json={
        "classroom_id": cls_id,
        "title": "Stoichiometry Lab",
        "presence_threshold_seconds": 45,
    })
    ses_id = ses_res.json()["id"]

    # Ingest detection of unknown participant
    det_res = client.post(f"/api/v1/sessions/{ses_id}/detections", json={
        "detections": [
            {
                "tracking_id": "TRK-99",
                "sustained_seconds": 50,
                "is_present": True,
            }
        ]
    })
    assert det_res.status_code == 200
    assert det_res.json()["updated"] == 1

    # Check attendance: must be UNVERIFIED because no enrolled participant is assigned
    att_res = client.get(f"/api/v1/sessions/{ses_id}/attendance")
    assert att_res.status_code == 200
    records = att_res.json()
    assert len(records) == 1
    rec = records[0]
    assert rec["tracking_id"] == "TRK-99"
    assert rec["status"] == "unverified"
    assert rec["verified_by_instructor"] is False

    # Manual instructor verification
    patch_res = client.patch(f"/api/v1/attendance/{rec['id']}", json={
        "status": "present",
        "verified_by_instructor": True,
        "notes": "Verified student identity at workbench",
    })
    assert patch_res.status_code == 200
    updated_rec = patch_res.json()
    assert updated_rec["status"] == "present"
    assert updated_rec["verified_by_instructor"] is True
    assert updated_rec["manual_override"] is True

def test_csv_export(client):
    csv_res = client.get("/api/v1/reports/attendance.csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Attendance ID" in csv_res.text
    assert "Tracking ID" in csv_res.text
