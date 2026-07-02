import pg from 'pg'

const email = process.argv[2] || 'jaderjdr2+reservaya-e2e@gmail.com'
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error('Missing DIRECT_URL or DATABASE_URL')
  process.exit(1)
}

const client = new pg.Client({ connectionString })
await client.connect()

const result = await client.query(
  `UPDATE auth.users
   SET email_confirmed_at = NOW()
   WHERE email = $1
   RETURNING id, email, email_confirmed_at`,
  [email]
)

if (result.rowCount === 0) {
  console.error('User not found:', email)
  process.exit(1)
}

console.log('confirmed:', result.rows[0].email)
await client.end()
