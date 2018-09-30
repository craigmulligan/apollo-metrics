const express = require('express')
const bodyParser = require('body-parser')
const proto = require('apollo-engine-reporting-protobuf')
const base64js = require('base64-js')
const _ = require('lodash')
const db = require('./db')
const Influx = require('influx')
const { ApolloServer, gql } = require('apollo-server')

function parseTS(message) {
  return new Date(message.seconds * 1000 + message.nanos / 1000)
}

const router = express.Router()

router.post(
  '/ingress/traces',
  bodyParser.raw({
    type: req => {
      return true
    },
  }),
  async (req, res) => {
    const instance = proto.FullTracesReport.decode(req.body)
    const report = proto.FullTracesReport.toObject(instance, {
      enums: String, // enums as string names
      longs: String, // longs as strings (requires long.js)
      bytes: String, // bytes as base64 encoded strings
      defaults: true, // includes default values
      arrays: true, // populates empty arrays (repeated fields) even if defaults=false
      objects: true, // populates empty objects (map fields) even if defaults=false
      oneofs: true, // includes virtual oneof fields set to the present field's name
    })

    const points = _.reduce(
      report.tracesPerQuery,
      (points, value, key) => {
        value.trace.forEach(trace => {
          points.push({
            measurement: 'trace',
            timestamp: parseTS(trace.startTime),
            fields: {
              duration: trace.durationNs,
            },
            tags: {
              query: key,
              host: trace.http.requestHeaders.host.value[0],
            },
          })
        })

        return points
      },
      [],
    )

    await db.writePoints(points)
    console.log('points written!', points)
    res.status(200).send()
  },
)

module.exports = router
