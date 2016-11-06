# tvdb.js

[![Build Status](https://travis-ci.org/saidM/tvdb.js.svg?branch=master)](https://travis-ci.org/saidM/tvdb.js)

Node.js wrapper for thetvdb.com API. It is promise-based and uses the ES6 syntax (you must at least use the stable version of Node.js).

- Promise-based
- Abstracts all the unnecessary data structure returned from thetvdb.com API
- Lowercase attributes
- Returns the season & episode numbers as integers
- Multi-language support

## Initialization

```javascript
const tv = require('tvdb.js')('API_KEY')
```

## Retrieve a show

Retrieve a show using its ID:

```javascript
tv.find('80279')
```

Retrive a show using its name:

```javascript
tv.find('The Big Bang Theory')
```

You can specify an optional language parameter (english by default), for example:

```javascript
tv.find('The Big Bang Theory', 'fr')
```

## Retrieve a show episodes

The query above returns the show as well as all the episodes:

```javascript
tv.find('The Big Bang Theory')
.then((serie) => {
  console.log('Name', serie.name)
  console.log('Overview', serie.overview)

  console.log('Episodes count', serie.episodes.length)

  // Make use of the native find Javascript function to filter the episodes
  const episode = serie.episodes.find(ep => ep.name == 'The Robotic Manipulation')
  console.log('Episode Name', episode.name) // The Robotic Manipulation

  // Access the episode's season and number
  console.log('Season', episode.season)
  console.log('Number', episode.number)
})
.catch(err => console.error(err) // Failed to fetch the serie
```
## Licence

MIT

    




  
