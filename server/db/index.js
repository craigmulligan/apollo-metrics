const Influx = require('influx')
const DB_NAME = 'reports'

const influx = new Influx.InfluxDB({
  host: 'localhost',
  database: DB_NAME,
  schema: [
    {
      measurement: 'trace',
      fields: {
        duration: Influx.FieldType.INTEGER,
      },
      tags: ['query', 'host'],
    },
  ],
})

module.exports = async () => {
  const names = await influx.getDatabaseNames()
  if (!names.includes(DB_NAME)) {
    await influx.createDatabase(DB_NAME)
  }

  return influx
}
