#!/usr/bin/env node
import 'dotenv/config';

const API = process.env.API_URL || 'http://localhost:5000';

async function req(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  return { status: res.status, body: json };
}

async function main() {
  try {
    console.log('Creating users...');
    const createAlice = await req('/api/auth/signup', 'POST', { name: 'Alice Thompson', email: 'alice@test.com', password: 'pass123' });
    const createBob = await req('/api/auth/signup', 'POST', { name: 'Bob Smith', email: 'bob@test.com', password: 'pass123' });
    const createSrilekha = await req('/api/auth/signup', 'POST', { name: 'Srilekha Gupta', email: 'srilekha@test.com', password: 'pass123' });

    console.log('Logging in as Alice...');
    const login = await req('/api/auth/login', 'POST', { email: 'alice@test.com', password: 'pass123' });
    const token = login.body.token;

    console.log('Creating project...');
    const proj = await req('/api/projects', 'POST', { name: 'Test Project', description: 'For name testing' }, token);
    const projectId = proj.body.project.id;

    // Test 1: Add by full name (case-sensitive)
    console.log('\n[Test 1] Add "Bob Smith" by exact name...');
    let r = await req(`/api/projects/${projectId}/members`, 'POST', { identifier: 'Bob Smith', role: 'member' }, token);
    console.log('Status:', r.status, 'Message:', r.body.message || r.body.error);

    // Test 2: Add by partial name (case-insensitive)
    console.log('\n[Test 2] Add "bob" (lowercase) by partial match...');
    r = await req(`/api/projects/${projectId}/members`, 'POST', { identifier: 'bob', role: 'member' }, token);
    console.log('Status:', r.status, 'Message:', r.body.message || r.body.error);

    // Test 3: Add by email
    console.log('\n[Test 3] Add by email "srilekha@test.com"...');
    r = await req(`/api/projects/${projectId}/members`, 'POST', { identifier: 'srilekha@test.com', role: 'admin' }, token);
    console.log('Status:', r.status, 'Message:', r.body.message || r.body.error);

    // Test 4: Try ambiguous partial match
    console.log('\n[Test 4] Try ambiguous partial "a" (should find multiple)...');
    r = await req(`/api/projects/${projectId}/members`, 'POST', { identifier: 'a', role: 'member' }, token);
    console.log('Status:', r.status, 'Message:', r.body.message || r.body.error);

    console.log('\n✅ Member name lookup test completed.');
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  }
}

main();
