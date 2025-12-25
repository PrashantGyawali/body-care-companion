// import fetch from 'node-fetch' // Using global fetch in Node 18+
// actually with type: module and node 18+ we have fetch.

const BASE_URL = 'http://localhost:3000/api/auth'

async function testAuth() {
  console.log('--- Starting Auth Tests ---')

  // 1. Register
  console.log('\n1. Testing Register...')
  const registerRes = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    }),
  })
  const registerData = await registerRes.json()
  console.log('Status:', registerRes.status)
  console.log('Body:', registerData)

  if (registerRes.status !== 201) {
    console.error('Register failed!')
    return
  }

  const token = registerData.token

  // 2. Login
  console.log('\n2. Testing Login...')
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: registerData.user.email,
      password: 'password123',
    }),
  })
  const loginData = await loginRes.json()
  console.log('Status:', loginRes.status)
  console.log('Body:', loginData)

  if (loginRes.status !== 200) {
     console.error('Login failed')
  }

  // 3. Get Me
  console.log('\n3. Testing Get Me...')
  const meRes = await fetch(`${BASE_URL}/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  const meData = await meRes.json()
  console.log('Status:', meRes.status)
  console.log('Body:', meData)

  if (meRes.status === 200 && meData.email === registerData.user.email) {
      console.log('\nSUCCESS: All auth tests passed!')
  } else {
      console.log('\nFAILURE: Get Me failed')
  }
}

// Wait a bit for server to start if running immediately
setTimeout(testAuth, 2000)
