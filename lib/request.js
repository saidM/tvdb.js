'use strict'

const req = require('request')
const parseString = require('xml2js').parseString
const _ = require('lodash')

const request = url => {
  return new Promise((resolve, reject) => {
    req(url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return reject(new Error('Your API key is invalid'))
      }

      // Parse the XML response to JSON
      parseString(body, (err, result) => {
        const jsonResponse = result

        // If the server returned an error, reject the promise with a custom message
        if (typeof jsonResponse.Error !== 'undefined') {
          return reject(new Error('The name or the ID of the serie is required'))
        }

        // If the server returned multiple series, grab the first one only
        const jsonSerie = (Array.isArray(jsonResponse.Data.Series)) ? jsonResponse.Data.Series[0] : jsonResponse.Data.Series

        // If the serie object is undefined, it means the API hasn't found the show
        if (typeof jsonSerie === 'undefined') {
          return reject(new Error('Serie was not found'))
        }

        // Transform all the serie keys to lowercase
        const serie = _.transform(jsonSerie, ((result, val, key) => {
          result[key.toLowerCase()] = val[0]
        }))

        // Rename the 'seriesname' attribute to 'name'
        serie.name = serie.seriesname
        delete serie.seriesname

        // If the client asked for the episodes, sanitize them as well
        if (url.indexOf('/all') > -1 && typeof jsonResponse.Data.Episode !== 'undefined') {
          // Do the same for all the episodes
          const episodes = []
          jsonResponse.Data.Episode.forEach(ep => {
            const episode = _.transform(ep, ((result, val, key) => {
              result[key.toLowerCase()] = val[0]
            }))

            // Rename the 'episodename' attribute to 'name'
            episode.name = episode.episodename
            delete episode.episodename

            // Rename the 'season' & 'number' attributes and transform them to integer
            episode.number = parseInt(episode.combined_episodenumber, 10)
            episode.season = parseInt(episode.combined_season, 10)
            delete episode.combined_episodenumber
            delete episode.combined_season

            episodes.push(episode)
          })

          // Attach the episodes to the serie object
          serie.episodes = episodes
        }

        resolve(serie)
      })
    })
  })
}

module.exports = request
