'use strict'

const request = require('./lib/request')

class TVDB {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  find(query, language = 'en') {
    if (typeof query === 'undefined') return new Promise((resolve, reject) => reject('The name or the ID of the serie is required'))

    if (isNaN(query)) {
      // Try to fetch the ID of the serie
      return request(`http://thetvdb.com/api/GetSeries.php?seriesname=${query}`)
      .then((serie) => {
        // Now that we have the ID, we can make the request to get the full serie episodes
        return request(`http://thetvdb.com/api/${this.apiKey}/series/${serie.id}/all/${language}.xml`)
      })
    } else {
      return request(`http://thetvdb.com/api/${this.apiKey}/series/${query}/all/${language}.xml`)
    }
  }
}

module.exports = apiKey => {
  const tv = new TVDB(apiKey)
  return { apiKey: tv.apiKey, find: tv.find }
}
