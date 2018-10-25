
async function config () {
  const dbHost = process.env.DB_HOST || 'localhost'
  const dbPort = Number(process.env.DB_PORT) || 8529
  const dbName = process.env.DB_NAME || 'sandbox'
  const dbUrl = `http://${dbHost}:${dbPort}`

  return {
    dbHost,
    dbPort,
    dbName,
    dbUrl
  }
}

async function getDb (database) {
  const { dbUrl, dbName } = config()
  const db = new arango.Database(dbUrl)

  await db.useDatabase(dbName)

  return db
}

async function test () {
  const r = require('ramda')
  const arango = require('arangojs')
  const buzJson = require('@buzuli/json')
  const durations = require('durations')

  const db = getDb()
}

async function run () {
  try {
    await test()
  } catch (error) {
    console.error('Fatal error:', error)
  }
}

run()
