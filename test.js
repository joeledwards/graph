// Supplies the configuration gleaned from the environment
function config () {
  const dbHost = process.env.DB_HOST || 'localhost'
  const dbPort = Number(process.env.DB_PORT) || 8529
  const dbName = process.env.DB_NAME || 'sandbox'
  const dbUrl = `http://${dbHost}:${dbPort}`

  return {
    dbHost,
    dbPort,
    dbUrl,
    dbName
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

async function getCollection (db, collectionName) {
  const collection = await db.collection(collectionName)
  console.info(`Selected collection '${collectionName}'`)

  try {
    await collection.create()
  } catch (error) {
    console.error(error)
    console.error(`Collection "${collectionName}" probably already exists.`)
  } finally {
    return collection
  }
}

// Test the AQL
async function testAql (db) {
  const moment = require('moment')
  const durations = require('durations')
  const { aql } = require('arangojs')

  console.info('[START] AQL test')

  const collection = await getCollection(db, 'graph')

  await collection.save({
    _key: `event_${moment.utc().valueOf()}`,
    date: moment.utc().format('YYYYMMDD_HHmmss')
  })

  const queryWatch = durations.stopwatch().start()
  const cursor = await db.query(aql`
    FOR doc IN ${collection}
    RETURN doc
  `)

  const keys = await cursor.map(doc => doc.date)
  
  console.info(`${keys.length} keys (took ${queryWatch})`)

  console.info('[END] AQL test')
}

// Test the graph functionality
async function testGraph (db) {
  const r = require('ramda')
  const moment = require('moment')
  const buzJson = require('@buzuli/json')
  const durations = require('durations')
  const { aql } = require('arangojs')

  console.info('[START] Graph test')
  console.info('[END] Graph test')
}

// Run all of the advanced tests
async function advancedTests (db) {
  await testAql(db)
  await testGraph(db)
}

// Update the metadata document
async function updateMetadata (db) {
  const buzJson = require('@buzuli/json')

  // Select the collection
  const coll = await getCollection(db, 'brain')

  // Fetch the metadata document
  try {
    const doc = await coll.document('meta')
    console.info(`Found metadata document:\n`, buzJson(doc))
  } catch (error) {
    console.error(error)
    console.error(`Document "meta" probably does not exists.`)

    // Create the document if it was missing
    await coll.save({ _key: 'meta', author: 'joel' })
  }

  // Update the metadata document
  const meta = await coll.update('meta', {
    author: 'Joel',
    updated: new Date().toISOString()
  })

  console.info('Metadata updated:\n', buzJson(meta))
}

// Run the tests
async function test () {
  require('log-a-log')()

  // Ge the connection
  const db = await getDb()
  console.info(`Got a DB connection.`)

  // ==================================
  // ========== Do some stuff =========
  // ==================================

  // Run the advanced tests
  try {
    console.info('Running advanced tests...')
    await advancedTests(db)
    console.info('Completed advanced tests.')
  } catch (error) {
    console.error('Error with advanced tests:', error)
    console.error('Error with advanced tests ☝🏼')
  }

  // Update the metadata document
  try {
    await updateMetadata(db)
  } catch (error) {
    console.error('Error updating metadata:', error)
    console.error('Error updating metadata ☝🏼')
  }

  // ===================================
  // ========== Did some stuff =========
  // ===================================

  // Wait a little, then exit
  const haltDelay = 2500
  console.info(`Waiting ${haltDelay} ms before halting`)
  await delay(haltDelay)
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
