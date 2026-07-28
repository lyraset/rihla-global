/**
 * Create or update an admin user directly in MongoDB. Credentials are passed as
 * CLI arguments (never from env / never committed), so this works the same in
 * local dev and production — point it at any MONGODB_URI and run it once.
 *
 *   npm run create-admin -- <email-or-username> <password> [name] [role]
 *   npm run create-admin -- admin admin123
 *
 * role: superadmin (default) | editor | viewer
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from '../lib/db.js'
import { AdminUser } from '../models/AdminUser.js'

const [, , identifierArg, password, nameArg, roleArg] = process.argv

if (!identifierArg || !password) {
  console.error('Usage: npm run create-admin -- <email-or-username> <password> [name] [role]')
  process.exit(1)
}

const identifier = identifierArg.toLowerCase().trim()
const role = roleArg || 'superadmin'
const name = nameArg || 'Administrator'

async function main() {
  await connectDB()
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await AdminUser.findOneAndUpdate(
    { email: identifier },
    {
      $set: { name, role, isActive: true, passwordHash, mustChangePassword: false },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  console.log(`✓ Admin ready in DB: "${user.email}"  role=${user.role}`)
  console.log('  Sign in at /admin/login with that identifier and the password you set.')
  await mongoose.connection.close()
  process.exit(0)
}

main().catch((err) => {
  console.error('Failed to create admin:', err.message || err)
  process.exit(1)
})
