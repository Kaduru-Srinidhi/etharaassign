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

async function createAndLogin(name, email, password) {
  await req('/api/auth/signup', 'POST', { name, email, password });
  const login = await req('/api/auth/login', 'POST', { email, password });
  if (login.status !== 200) throw new Error('Login failed: ' + JSON.stringify(login));
  return login.body;
}

async function main() {
  try {
    console.log('Creating users Alice (admin) and Bob (member)...');
    const alice = await createAndLogin('Alice', 'alice@example.com', 'password1');
    const bob = await createAndLogin('Bob', 'bob@example.com', 'password2');

    const aliceToken = alice.token;
    const bobToken = bob.token;
    const aliceId = alice.user?.id;
    const bobId = bob.user?.id;

    console.log('Creating project as Alice...');
    const p = await req('/api/projects', 'POST', { name: 'Demo Project', description: 'E2E demo' }, aliceToken);
    if (!(p.status === 201 || p.status === 200)) throw new Error('Project create failed: ' + JSON.stringify(p));
    const project = p.body.project || p.body;
    const projectId = project.id;
    console.log('Project id:', projectId);

    console.log('Adding Bob as member...');
    const add = await req(`/api/projects/${projectId}/members`, 'POST', { userId: bobId, role: 'member' }, aliceToken);
    console.log('Add member:', add.status, add.body);

    console.log('Creating a task assigned to Bob...');
    const taskRes = await req(`/api/tasks/${projectId}/tasks`, 'POST', { title: 'Demo Task', description: 'Task for Bob', assigned_to: bobId, priority: 'high', due_date: null }, aliceToken);
    console.log('Create task:', taskRes.status, taskRes.body);
    const taskId = taskRes.body.task?.id || taskRes.body.id;

    console.log('Bob fetching dashboard (should see assigned task)...');
    const dash = await req('/api/tasks/dashboard/overview', 'GET', null, bobToken);
    console.log('Dashboard:', dash.status, dash.body);

    console.log('Updating task status to in-progress as Bob...');
    const upd = await req(`/api/tasks/${projectId}/tasks/${taskId}`, 'PUT', { status: 'in-progress' }, bobToken);
    console.log('Update task:', upd.status, upd.body);

    console.log('Updating task status to done as Bob...');
    const upd2 = await req(`/api/tasks/${projectId}/tasks/${taskId}`, 'PUT', { status: 'done' }, bobToken);
    console.log('Update task:', upd2.status, upd2.body);

    console.log('Final dashboard for Bob:');
    const dash2 = await req('/api/tasks/dashboard/overview', 'GET', null, bobToken);
    console.log('Dashboard after updates:', dash2.status, dash2.body);

    console.log('E2E demo completed successfully.');
  } catch (err) {
    console.error('E2E demo error:', err);
    process.exitCode = 1;
  }
}

main();
