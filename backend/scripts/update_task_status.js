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
    console.log('Logging in as Bob...');
    const login = await req('/api/auth/login', 'POST', { email: 'bob@example.com', password: 'password2' });
    if (login.status !== 200) throw new Error('Bob login failed');
    const token = login.body.token;

    const dash = await req('/api/tasks/dashboard/overview', 'GET', null, token);
    if (dash.status !== 200) throw new Error('Failed to fetch dashboard');
    const task = dash.body.tasks && dash.body.tasks[0];
    if (!task) { console.log('No tasks found for Bob'); return; }
    const projectId = task.project_id;
    const taskId = task.id;
    console.log('Found task', taskId, 'in project', projectId);

    console.log('Setting status -> in-progress');
    const r1 = await req(`/api/tasks/${projectId}/tasks/${taskId}`, 'PUT', { status: 'in-progress' }, token);
    console.log('Result:', r1.status, r1.body);

    console.log('Setting status -> done');
    const r2 = await req(`/api/tasks/${projectId}/tasks/${taskId}`, 'PUT', { status: 'done' }, token);
    console.log('Result:', r2.status, r2.body);

    const dash2 = await req('/api/tasks/dashboard/overview', 'GET', null, token);
    console.log('Dashboard now:', dash2.status, dash2.body);
  } catch (err) {
    console.error('update_task_status error:', err);
    process.exitCode = 1;
  }
}

main();
