import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Looks for .env in the same folder as index.js
dotenv.config({ path: path.resolve(__dirname, '../.env') })


console.log("Checking Environment Variables...")
console.log("Supabase URL exists:", !!process.env.SUPABASE_URL)
console.log("Port:", process.env.PORT)

// 1. Initialize Supabase with Service Role Key (Bypasses RLS for backend tasks)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const app = express()
const port = process.env.PORT || 5175
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me'
const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null

// 2. CORS Configuration
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())

// 3. Helper to issue JWTs
const issueToken = (user, extraClaims = {}) => {
  return jwt.sign(
    { sub: user.id, email: user.email, ...extraClaims },
    jwtSecret,
    { expiresIn: '7d' }
  )
}

// --- ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: 'Supabase Connected' })
})

// SIGNUP: Creates entry in auth.users AND public.profiles
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, displayName } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    // A. Create user in Supabase Auth (hidden table)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) return res.status(400).json({ error: authError.message })

    // B. Create the Profile in your public.profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: authData.user.id, 
        email: email,
        display_name: displayName || email.split('@')[0]
      }])
      .select()
      .single()

    if (profileError) return res.status(400).json({ error: profileError.message })

    const displayName = profile.display_name || profile.email?.split('@')[0] || 'Guest'
    const firstName = displayName.split(' ')[0]
    const token = issueToken(profile, { name: displayName, given_name: firstName })
    res.status(201).json({ token, user: profile })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Server error during signup.' })
  }
})

// SIGNIN: Uses Supabase Auth to verify, then returns Profile
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body || {}

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) return res.status(401).json({ error: 'Invalid credentials.' })

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) return res.status(404).json({ error: 'Profile not found.' })

    const displayName = profile.display_name || profile.email?.split('@')[0] || 'Guest'
    const firstName = displayName.split(' ')[0]
    const token = issueToken(profile, { name: displayName, given_name: firstName })
    res.json({ token, user: profile })
  } catch (err) {
    res.status(500).json({ error: 'Server error during signin.' })
  }
})

// GOOGLE AUTH: Verifies token, then ensures Profile exists
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body || {}

  if (!googleClient || !credential) {
    return res.status(400).json({ error: 'Google configuration missing.' })
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    })

    const payload = ticket.getPayload()
    const { email, name, given_name: givenName, picture } = payload

    // Check if profile exists
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    // If no profile, create one (Note: For Google, we skip auth.admin.createUser 
    // because they are authenticated via Google's token)
    if (!profile) {
      let existingUser = null
      if (typeof supabase.auth.admin.getUserByEmail === 'function') {
        const { data, error } = await supabase.auth.admin.getUserByEmail(email)
        if (error) throw error
        existingUser = data?.user || null
      } else {
        const { data, error } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000
        })
        if (error) throw error
        existingUser = data?.users?.find((user) => user.email === email) || null
      }

      let authUserId = existingUser?.id

      if (!authUserId) {
        const { data: createdUser, error: createUserError } =
          await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { full_name: name, provider: 'google' }
          })
        if (createUserError) throw createUserError
        authUserId = createdUser.user.id
      }

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: authUserId,
          email: email, 
          display_name: name,
          provider: 'google'
        }])
        .select()
        .single()
      
      if (profileError) throw profileError
      profile = newProfile
    } else if (name && profile.display_name !== name) {
      const emailPrefix = email?.split('@')[0] || ''
      if (!profile.display_name || profile.display_name === emailPrefix) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ display_name: name })
          .eq('id', profile.id)
          .select()
          .single()

        if (updateError) throw updateError
        profile = updatedProfile
      }
    }

    const displayName = name || profile.display_name || profile.email?.split('@')[0] || 'Guest'
    const firstName = givenName || displayName.split(' ')[0]
    const token = issueToken(profile, { name: displayName, given_name: firstName, picture })
    res.json({ token, user: profile })
  } catch (error) {
    console.error('Google error:', error)
    res.status(401).json({ error: 'Invalid Google login.' })
  }
})

// URL FETCH ROUTE
app.post('/api/fetch-url', async (req, res) => {
  const { url } = req.body || {}
  if (!url) return res.status(400).json({ error: 'URL is required.' })

  try {
    const response = await fetch(url)
    const text = await response.text()
    res.json({ content: text.slice(0, 50000) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content.' })
  }
})

// SAVE A CONVERSATION
app.post('/api/conversations', async (req, res) => {
  const { userId, title, content, summary, takeaways, keywords } = req.body || {}

  if (!userId || !content) {
    return res.status(400).json({ error: 'User ID and content are required.' })
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: userId,
        title: title || 'New Conversation',
        content,
        summary,
        takeaways: takeaways || [],
        keywords: keywords || []
      }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('Save error:', err)
    res.status(500).json({ error: 'Failed to save conversation.' })
  }
})

// GET ALL CONVERSATIONS FOR A USER
app.get('/api/conversations/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations.' })
  }
})

app.listen(port, () => {
  console.log(`Auth server running on http://localhost:${port}`)
})
