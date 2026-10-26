// Integration test suite for Multimodal Attendance & Engagement Agent API
import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:3000';

async function run() {
  console.log('--- Starting API Integration Tests ---');

  // 1. Health
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200');
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'healthy');
  console.log('✓ Health endpoint verified:', healthData);

  // 2. System Capabilities
  const capRes = await fetch(`${BASE_URL}/api/v1/system/capabilities`);
  assert.strictEqual(capRes.status, 200);
  const caps = await capRes.json();
  assert.strictEqual(typeof caps.visionEnabled, 'boolean');
  assert.strictEqual(typeof caps.audioVadEnabled, 'boolean');
  console.log('✓ System Capabilities verified (visionEnabled:', caps.visionEnabled, ', audioVadEnabled:', caps.audioVadEnabled, ')');

  // 3. Classrooms & Participants
  const clsRes = await fetch(`${BASE_URL}/api/v1/classrooms`);
  assert.strictEqual(clsRes.status, 200);
  const classrooms = await clsRes.json();
  assert.ok(classrooms.length > 0, 'Classrooms should have seed data');
  console.log(`✓ Classrooms verified (${classrooms.length} found)`);

  const partsRes = await fetch(`${BASE_URL}/api/v1/participants`);
  assert.strictEqual(partsRes.status, 200);
  const participants = await partsRes.json();
  assert.ok(participants.length > 0, 'Participants should have seed data');
  console.log(`✓ Participants verified (${participants.length} found)`);

  // 4. Sessions
  const sesRes = await fetch(`${BASE_URL}/api/v1/sessions`);
  assert.strictEqual(sesRes.status, 200);
  const sessions = await sesRes.json();
  assert.ok(sessions.length > 0, 'Sessions should have seed data');
  const activeSession = sessions.find(s => s.status === 'active') || sessions[0];
  console.log(`✓ Sessions verified (Active: ${activeSession.title})`);

  // 5. Attendance & Reports bug check
  const allAttRes = await fetch(`${BASE_URL}/api/v1/attendance`);
  assert.strictEqual(allAttRes.status, 200);
  const allAtt = await allAttRes.json();
  assert.ok(Array.isArray(allAtt), 'Attendance should return an array');
  assert.ok(allAtt.length > 0, 'Attendance should not be empty');
  console.log(`✓ GET /api/v1/attendance verified (${allAtt.length} records retrieved)`);

  // 6. Filtered attendance by sessionId
  const sesAttRes = await fetch(`${BASE_URL}/api/v1/attendance?sessionId=${activeSession.id}`);
  assert.strictEqual(sesAttRes.status, 200);
  const sesAtt = await sesAttRes.json();
  assert.ok(Array.isArray(sesAtt));
  assert.strictEqual(sesAtt.every(a => a.sessionId === activeSession.id), true);
  console.log(`✓ Filtered attendance verified (${sesAtt.length} records for session ${activeSession.id})`);

  // 7. Attendance Manual Override / Instructor Verification
  const testRecord = allAtt.find(a => a.status === 'unverified') || allAtt[0];
  const patchRes = await fetch(`${BASE_URL}/api/v1/attendance/${testRecord.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verifiedByInstructor: true,
      notes: 'QA Integration Test Verification',
    }),
  });
  assert.strictEqual(patchRes.status, 200);
  const updatedRec = await patchRes.json();
  assert.strictEqual(updatedRec.verifiedByInstructor, true);
  assert.strictEqual(updatedRec.manualOverride, true);
  console.log('✓ Attendance PATCH verification and manual override confirmed');

  // 8. Session Metrics
  const metricsRes = await fetch(`${BASE_URL}/api/v1/sessions/${activeSession.id}/metrics`);
  assert.strictEqual(metricsRes.status, 200);
  const metrics = await metricsRes.json();
  assert.ok(Array.isArray(metrics));
  console.log(`✓ Session metrics verified (${metrics.length} telemetry points)`);

  // 9. Recommendations and Recalculation
  const recRes = await fetch(`${BASE_URL}/api/v1/sessions/${activeSession.id}/recommendations`);
  assert.strictEqual(recRes.status, 200);
  const recs = await recRes.json();
  assert.ok(Array.isArray(recs));
  console.log(`✓ Teaching AI recommendations verified (${recs.length} suggestions)`);

  const recalcRes = await fetch(`${BASE_URL}/api/v1/sessions/${activeSession.id}/recommendations/recalculate`, {
    method: 'POST',
  });
  assert.strictEqual(recalcRes.status, 200);
  const recalcData = await recalcRes.json();
  assert.ok(Array.isArray(recalcData));
  console.log(`✓ Recommendation engine recalculation verified (${recalcData.length} generated)`);

  // 10. CSV Export - All and Session-specific
  const csvResAll = await fetch(`${BASE_URL}/api/v1/reports/attendance.csv`);
  assert.strictEqual(csvResAll.status, 200);
  assert.strictEqual(csvResAll.headers.get('content-type'), 'text/csv; charset=utf-8');
  const csvAllText = await csvResAll.text();
  assert.ok(csvAllText.includes('Attendance ID'), 'CSV must include header row');
  assert.ok(csvAllText.includes(testRecord.id), 'CSV must contain existing attendance records');
  console.log(`✓ CSV export (All Sessions) verified (${csvAllText.split('\r\n').length - 2} data rows)`);

  const csvResFiltered = await fetch(`${BASE_URL}/api/v1/reports/attendance.csv?sessionId=${activeSession.id}`);
  assert.strictEqual(csvResFiltered.status, 200);
  const csvFiltText = await csvResFiltered.text();
  assert.ok(csvFiltText.includes('Attendance ID'));
  console.log('✓ CSV export (Filtered Session) verified');

  // 11. Privacy & Audit Logs
  const privRes = await fetch(`${BASE_URL}/api/v1/privacy/settings`);
  assert.strictEqual(privRes.status, 200);
  const priv = await privRes.json();
  assert.strictEqual(typeof priv.rawVideoStorageEnabled, 'boolean');
  console.log('✓ Privacy settings verified (rawVideoStorageEnabled:', priv.rawVideoStorageEnabled, ')');

  const auditRes = await fetch(`${BASE_URL}/api/v1/audit-events`);
  assert.strictEqual(auditRes.status, 200);
  const audits = await auditRes.json();
  assert.ok(Array.isArray(audits) && audits.length > 0, 'Audit events should record actions');
  console.log(`✓ Audit log verified (${audits.length} events on file)`);

  console.log('\n✅ ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('❌ API Integration Test Failed:', err);
  process.exit(1);
});
