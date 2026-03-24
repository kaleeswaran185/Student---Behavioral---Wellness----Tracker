#!/usr/bin/env node

const args = new Set(process.argv.slice(2))

if (args.has('--help')) {
  console.log(`Usage: node scripts/staging-smoke.mjs

Required environment variables:
  STAGING_API_URL

Optional environment variables:
  STAGING_WEB_URL
  STAGING_TEACHER_EMAIL
  STAGING_TEACHER_PASSWORD
  STAGING_STUDENT_EMAIL
  STAGING_STUDENT_PASSWORD

Defaults:
  teacher@school.com / password123
  alice@school.com / password123

This smoke test performs real write operations against the staging API:
  - student login
  - teacher login
  - student history create/list
  - SOS alert create/read
  - teacher/student messaging
`)
  process.exit(0)
}

const required = (name) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const apiBase = required('STAGING_API_URL').replace(/\/$/, '')
const webBase = String(process.env.STAGING_WEB_URL || '').trim().replace(/\/$/, '')
const teacherEmail = process.env.STAGING_TEACHER_EMAIL || 'teacher@school.com'
const teacherPassword = process.env.STAGING_TEACHER_PASSWORD || 'password123'
const studentEmail = process.env.STAGING_STUDENT_EMAIL || 'alice@school.com'
const studentPassword = process.env.STAGING_STUDENT_PASSWORD || 'password123'
const runId = `smoke-${Date.now()}`

const log = (message) => console.log(`[staging-smoke] ${message}`)

const request = async (path, options = {}) => {
  const response = await fetch(`${apiBase}${path}`, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data.message || data.error || `HTTP ${response.status}`
    throw new Error(`${path} failed: ${message}`)
  }

  return data
}

const login = async (email, password) =>
  request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

try {
  log(`Using API ${apiBase}`)

  if (webBase) {
    const page = await fetch(webBase)
    if (!page.ok) {
      throw new Error(`Web URL check failed with status ${page.status}`)
    }
    log(`Web root responded from ${webBase}`)
  }

  const health = await request('/health')
  log(`Health OK: env=${health.environment}, db=${health.database}`)

  const teacher = await login(teacherEmail, teacherPassword)
  log(`Teacher login OK: ${teacher.email}`)

  const student = await login(studentEmail, studentPassword)
  log(`Student login OK: ${student.email}`)

  await request('/api/history/checkin', {
    method: 'POST',
    headers: authHeaders(student.token),
    body: JSON.stringify({
      mood: 'Calm',
      emoji: '🙂',
      note: `Staging smoke check-in ${runId}`,
    }),
  })
  log('Student check-in created')

  const history = await request('/api/history', {
    headers: { Authorization: `Bearer ${student.token}` },
  })
  if (!Array.isArray(history) || history.length === 0) {
    throw new Error('Student history was empty after check-in')
  }
  log(`Student history OK: ${history.length} items`)

  const sos = await request('/api/alerts/sos', {
    method: 'POST',
    headers: authHeaders(student.token),
    body: JSON.stringify({
      alert: {
        severity: 'High',
        type: 'SOS Triggered',
        message: `Staging smoke alert ${runId}`,
      },
    }),
  })
  const createdAlertId = sos.alert?.id
  if (!createdAlertId) {
    throw new Error('SOS alert did not return an alert id')
  }
  log(`SOS alert created: ${createdAlertId}`)

  const alerts = await request('/api/alerts', {
    headers: { Authorization: `Bearer ${teacher.token}` },
  })
  const matchingAlert = alerts.find((alert) => String(alert.id) === String(createdAlertId))
  if (!matchingAlert) {
    throw new Error('Teacher could not find the created SOS alert')
  }
  log('Teacher alert list OK')

  await request(`/api/alerts/${createdAlertId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${teacher.token}` },
  })
  log('Teacher marked alert as read')

  await request('/api/messages', {
    method: 'POST',
    headers: authHeaders(teacher.token),
    body: JSON.stringify({
      studentId: student._id,
      text: `Staging smoke message ${runId}`,
    }),
  })
  log('Teacher message created')

  const conversation = await request(`/api/messages/${student._id}`, {
    headers: { Authorization: `Bearer ${student.token}` },
  })
  const matchingMessage = conversation.find((message) => String(message.text || '').includes(runId))
  if (!matchingMessage) {
    throw new Error('Student conversation did not include the staging smoke message')
  }
  log('Student message thread OK')

  log('Smoke test passed')
} catch (error) {
  console.error(`[staging-smoke] FAILED: ${error.message}`)
  process.exit(1)
}
