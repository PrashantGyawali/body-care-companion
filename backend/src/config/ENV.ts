import 'dotenv/config'

const getEnv = (key: string) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}

const ENV = {
  MONGODB_URI: getEnv('MONGODB_URI'),
  JWT_SECRET: getEnv('JWT_SECRET'),
}

export default ENV
