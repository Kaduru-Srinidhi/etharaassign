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

async function ensureUser(name, email, password) {
  let r = await req('/api/auth/signup', 'POST', { name, email, password });
  if (r.status === 201) return r.body;
  if (r.status === 400 && r.body && r.body.error && r.body.error.includes('User already exists')) {
    // login
    const login = await req('/api/auth/login', 'POST', { email, password });
    if (login.status === 200) return login.body;
  }
  throw new Error(`Failed to create/login user ${email}: ${JSON.stringify(r)}`);
}

async function main() {
  try {
    console.log('Ensuring users...');
    const alice = await ensureUser('Alice', 'alice@example.com', 'password1');
    const bob = await ensureUser('Bob', 'bob@example.com', 'password2');

    // Ensure we have fresh login responses (token + user id)
    const la = await req('/api/auth/login', 'POST', { email: 'alice@example.com', password: 'password1' });
    const lb = await req('/api/auth/login', 'POST', { email: 'bob@example.com', password: 'password2' });
    if (la.status !== 200 || lb.status !== 200) throw new Error('Unable to obtain tokens for users');
    const aliceToken = la.body.token;
    const bobToken = lb.body.token;
    const aliceId = la.body.user?.id;
    const bobId = lb.body.user?.id;
    if (!aliceId || !bobId) throw new Error('Could not determine user ids from login responses');

    console.log('Creating project as Alice...');
    const projRes = await req('/api/projects', 'POST', { name: 'Proj1', description: 'Test project' }, aliceToken);
    if (projRes.status !== 201 && projRes.status !== 200) throw new Error('Project creation failed: ' + JSON.stringify(projRes));
    const project = projRes.body.project || projRes.body;
    const pid = project.id || project.project?.id || project[0]?.id;
    if (!pid) throw new Error('Could not determine project id from response: ' + JSON.stringify(project));
    console.log('Project created:', pid);

    console.log('Adding Bob as member...');
    const addRes = await req(`/api/projects/${pid}/members`, 'POST', { userId: bobId, role: 'member' }, aliceToken);
    console.log('Add member response:', addRes.status, addRes.body);

    console.log('Attempting delete as Bob (should be denied)...');
    const delByBob = await req(`/api/projects/${pid}`, 'DELETE', null, bobToken);
    console.log('Delete by Bob status:', delByBob.status);
    if (delByBob.status === 200 || delByBob.status === 204) {
      throw new Error('Bob should NOT be able to delete project as member');
    }

    console.log('Promoting Bob to admin...');
    const promote = await req(`/api/projects/${pid}/members`, 'POST', { userId: bobId, role: 'admin' }, aliceToken);
    console.log('Promote response:', promote.status, promote.body);

    console.log('Attempting delete as Bob (should succeed)...');
    const delAfter = await req(`/api/projects/${pid}`, 'DELETE', null, bobToken);
    console.log('Delete after promote status:', delAfter.status, delAfter.body);

    if (delAfter.status === 200 || delAfter.status === 204) {
      console.log('RBAC test passed: Bob deleted project after being promoted to admin.');
    } else {
      console.error('RBAC test failed: Bob could not delete after promotion.', delAfter);
      process.exitCode = 2;
    }
  } catch (err) {
    console.error('Test script error:', err);
    process.exitCode = 1;
  }
}

main();
