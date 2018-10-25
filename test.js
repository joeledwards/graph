// Supplies the configuration gleaned from the environment
function config () {
  const dbHost = process.env.DB_HOST || 'localhost'
  const dbPort = Number(process.env.DB_PORT) || 8529
  const dbName = process.env.DB_NAME || 'sandbox'
  const dbCollection = process.env.DB_COLLECTION || 'brain'
  const dbUrl = `http://${dbHost}:${dbPort}`

  return {
    dbHost,
    dbPort,
    dbUrl,
    dbName,
    dbCollection
  }
}

// Delays for a number of milliseconds
function delay (duration) {
  return new Promise (r => setTimeout(r, duration))
}

// Supplies a database connection
async function getDb () {
  const arango = require('arangojs')

  const { dbUrl, dbName } = config()
  const db = new arango.Database(dbUrl)

  try {
    await db.createDatabase(dbName)
  } catch (error) {
    console.error(error)
    console.error(`Database "${dbName}" probably already exists.`)
  } finally {
    await db.useDatabase(dbName)
  }

  return db
}

async function advancedTests () {
  return false
}

// Run the tests
async function test () {
  require('log-a-log')()

  const r = require('ramda')
  const buzJson = require('@buzuli/json')
  const durations = require('durations')

  const { dbCollection } = config()

  // Ge the connection
  const db = await getDb()
  console.info(`Got a DB connection.`)

  // Select the collection
  const coll = await db.collection(dbCollection)
  console.info(`Selected collection '${dbCollection}'`)

  try {
    await coll.create()
  } catch (error) {
    console.error(error)
    console.error(`Collection "${dbCollection}" probably already exists.`)
  }

  // ==================================
  // ========== Do some stuff =========
  // ==================================

  try {
    console.info('Running advanced tests...')
    await advancedTests()
    console.info('Completed advanced tests.')
  } catch (error) {
    console.error('Error with advanced tests:', error)
    console.error('Error with advanced tests ☝🏼')
  }

  // Fetch the document (if it exist)
  try {
    doc = await coll.document('meta')
    console.info(`Found metadata document:\n`, buzJson(doc))
  } catch (error) {
    console.error(error)
    console.error(`Document "meta" probably doesnt exists.`)

    // Create the document if it was missing
    coll.save({ _key: 'meta', author: 'joel' })
  }

  // Update the document
  const meta = await coll.update('meta', {
    author: 'Joel',
    updated: new Date().toISOString()
  })

  console.info('Metadata updated:\n', buzJson(meta))

  // ===================================
  // ========== Did some stuff =========
  // ===================================

  // Wait a little, then exit
  await delay(1000)
  console.info(`Bye!`)
}

// Run the program
async function run () {
  try {
    await test()
  } catch (error) {
    console.error(error)
    console.error('Fatal error ☝🏼')
  }
}

run()
