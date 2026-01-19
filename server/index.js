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
const authCookieName = 'auth_token'
const isProd = process.env.NODE_ENV === 'production'

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

const readCookie = (req, name) => {
  const raw = req.headers.cookie || ''
  if (!raw) return null
  const parts = raw.split(';').map((part) => part.trim())
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1))
    }
  }
  return null
}

const requireAuth = (req, res, next) => {
  const token = readCookie(req, authCookieName)
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }
  try {
    const payload = jwt.verify(token, jwtSecret)
    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' })
  }
}

const setAuthCookie = (res, token) => {
  res.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

const clearAuthCookie = (res) => {
  res.cookie(authCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 0
  })
}

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

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, avatar_url, theme')
      .eq('id', req.user.sub)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Profile not found.' })
    }

    res.json({ user: profile })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile.' })
  }
})

app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
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
    setAuthCookie(res, token)
    res.status(201).json({ user: profile })
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
    setAuthCookie(res, token)
    res.json({ user: profile })
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
          avatar_url: picture || null
        }])
        .select()
        .single()
      
      if (profileError) throw profileError
      profile = newProfile
    } else {
      const updates = {}
      const emailPrefix = email?.split('@')[0] || ''
      if (name && profile.display_name !== name) {
        if (!profile.display_name || profile.display_name === emailPrefix) {
          updates.display_name = name
        }
      }
      if (picture && profile.avatar_url !== picture) {
        updates.avatar_url = picture
      }
      if (Object.keys(updates).length > 0) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update(updates)
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
    setAuthCookie(res, token)
    res.json({ user: profile })
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

// PROFILE THEME
app.put('/api/profile/theme', requireAuth, async (req, res) => {
  const { theme } = req.body || {}
  if (theme !== 'light' && theme !== 'dark') {
    return res.status(400).json({ error: 'Invalid theme.' })
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ theme })
      .eq('id', req.user.sub)
      .select()
      .single()

    if (error) throw error
    res.json({ user: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update theme.' })
  }
})

// SPACES
app.get('/api/spaces', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('user_id', req.user.sub)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch spaces.' })
  }
})

app.post('/api/spaces', requireAuth, async (req, res) => {
  const { name } = req.body || {}
  if (!name) {
    return res.status(400).json({ error: 'Space name is required.' })
  }

  try {
    const { data, error } = await supabase
      .from('spaces')
      .insert([{ name, user_id: req.user.sub }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create space.' })
  }
})

// CONVERSATIONS
app.get('/api/conversations', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', req.user.sub)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations.' })
  }
})

app.get('/api/conversations/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.sub)
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(404).json({ error: 'Conversation not found.' })
  }
})

app.post('/api/conversations', requireAuth, async (req, res) => {
  const { title, content, summary, takeaways, keywords, spaceId } = req.body || {}
  if (!content) {
    return res.status(400).json({ error: 'Content is required.' })
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: req.user.sub,
        space_id: spaceId || null,
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

app.put('/api/conversations/:id/notes', requireAuth, async (req, res) => {
  const { id } = req.params
  const { notes, title } = req.body || {}
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        notes: notes || '',
        notes_title: title || null
      })
      .eq('id', id)
      .eq('user_id', req.user.sub)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to save notes.' })
  }
})

// CHAT MESSAGES
app.get('/api/chat_messages/:conversationId', requireAuth, async (req, res) => {
  const { conversationId } = req.params
  try {
    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', req.user.sub)
      .single()

    if (convoError || !convo) {
      return res.status(404).json({ error: 'Conversation not found.' })
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat messages.' })
  }
})

app.post('/api/chat_messages', requireAuth, async (req, res) => {
  const { conversationId, role, content } = req.body || {}
  if (!conversationId || !role || !content) {
    return res.status(400).json({ error: 'conversationId, role, and content are required.' })
  }

  try {
    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', req.user.sub)
      .single()

    if (convoError || !convo) {
      return res.status(404).json({ error: 'Conversation not found.' })
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ conversation_id: conversationId, role, content }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to save chat message.' })
  }
})

// FLASHCARDS
app.get('/api/flashcards/:conversationId', requireAuth, async (req, res) => {
  const { conversationId } = req.params
  try {
    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', req.user.sub)
      .single()

    if (convoError || !convo) {
      return res.status(404).json({ error: 'Conversation not found.' })
    }

    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flashcards.' })
  }
})

app.post('/api/flashcards/:conversationId', requireAuth, async (req, res) => {
  const { conversationId } = req.params
  const { cards } = req.body || {}
  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ error: 'Cards are required.' })
  }

  try {
    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', req.user.sub)
      .single()

    if (convoError || !convo) {
      return res.status(404).json({ error: 'Conversation not found.' })
    }

    const { error: deleteError } = await supabase
      .from('flashcards')
      .delete()
      .eq('conversation_id', conversationId)

    if (deleteError) throw deleteError

    const inserts = cards.map((card) => ({
      conversation_id: conversationId,
      question: card.question,
      answer: card.answer
    }))

    const { data, error } = await supabase
      .from('flashcards')
      .insert(inserts)
      .select()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to save flashcards.' })
  }
})

app.listen(port, () => {
  console.log(`Auth server running on http://localhost:${port}`)
})
