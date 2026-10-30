// Shared MongoDB connection. Runs on the host, never in the browser.
// Required server environment variables:
//   MONGODB_URI   Atlas connection string (mongodb+srv://...)
//   MONGODB_DB    Database name (defaults to "zedmega")

import { MongoClient, type Db } from 'mongodb'

// Reuse one client across warm serverless invocations.
const globalForMongo = globalThis as typeof globalThis & { _mongoClient?: Promise<MongoClient> }

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set.')
  globalForMongo._mongoClient ??= new MongoClient(uri).connect()
  try {
    const client = await globalForMongo._mongoClient
    return client.db(process.env.MONGODB_DB || 'zedmega')
  } catch (error) {
    globalForMongo._mongoClient = undefined
    throw error
  }
}
