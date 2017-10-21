'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const nock = require('nock')

const tv = require('../index')('API_KEY')

const expect = chai.expect
chai.use(chaiAsPromised)

describe('TVDB', () => {
  describe('#find', () => {
    it('rejects the promise if there is no parameter passed to the function', () => {
      const promise = tv.find()
      return expect(promise).to.eventually.be.rejectedWith('The name or the ID of the serie is required')
    })

    context('when the parameter is an integer', () => {
      it('makes a request to the /series/{id}/all/en.xml route', () => {
        const mock = nock('http://thetvdb.com/api')
          .get('/API_KEY/series/123/all/en.xml')
          .reply('200', '<Data><Series><id>123</id></Series></Data>', {'Content-Type': 'application/xml'})

        const promise = tv.find('123')
        return promise.then(() => expect(mock.isDone()).to.be.true)
      })

      it('returns the serie and all the episodes', () => {
        nock('http://thetvdb.com/api')
        .get('/API_KEY/series/123/all/en.xml')
        .reply('200', '<Data><Series><id>123</id><seriesname>Dexter</seriesname></Series><Episode><id>1</id></Episode><Episode><id>2</id></Episode></Data>', {'Content-Type': 'application/xml'})

        const promise = tv.find('123')
        return promise.then(serie => {
          expect(serie.id).to.equal('123')
          expect(serie.name).to.equal('Dexter')
          expect(serie.episodes.length).to.equal(2)
        })
      })

      it('formats correctly the episode number & season', () => {
        nock('http://thetvdb.com/api')
        .get('/API_KEY/series/123/all/en.xml')
        .reply('200', '<Data><Series><id>123</id><seriesname>Dexter</seriesname></Series><Episode><Combined_episodenumber>1.0</Combined_episodenumber><Combined_season>1.0</Combined_season></Episode><Episode><id>2</id><Combined_episodenumber>2.0</Combined_episodenumber><Combined_season>1.0</Combined_season></Episode></Data>', {'Content-Type': 'application/xml'})

        const promise = tv.find('123')
        return promise.then(serie => {
          expect(serie.episodes[0].season).to.equal(1)
          expect(serie.episodes[0].number).to.equal(1)
          expect(serie.episodes[1].season).to.equal(1)
          expect(serie.episodes[1].number).to.equal(2)
        })
      })
    })

    context('when the parameter is a string', () => {
      it('makes 2 HTTP requests', () => {
        const mock = nock('http://thetvdb.com/api')
          .get('/GetSeries.php?seriesname=Dexter')
          .reply('200', '<Data><Series><id>123</id></Series></Data>', {'Content-Type': 'application/xml'})

        const mock2 = nock('http://thetvdb.com/api')
          .get('/API_KEY/series/123/all/en.xml')
          .reply('200', '<Data><Series><id>123</id><seriesname>Dexter</seriesname></Series></Data>', {'Content-Type': 'application/xml'})

        return tv.find('Dexter')
        .then(() => {
          expect(mock.isDone()).to.be.true
          expect(mock2.isDone()).to.be.true
        })
      })

      it('resolves the promise with the serie and the episodes', () => {
        nock('http://thetvdb.com/api')
          .get('/GetSeries.php?seriesname=Dexter')
          .reply('200', '<Data><Series><id>123</id></Series></Data>', {'Content-Type': 'application/xml'})

        nock('http://thetvdb.com/api')
          .get('/API_KEY/series/123/all/en.xml')
          .reply('200', '<Data><Series><id>123</id><seriesname>Dexter</seriesname></Series><Episode><Combined_episodenumber>1.0</Combined_episodenumber><Combined_season>1.0</Combined_season></Episode><Episode><id>2</id><Combined_episodenumber>2.0</Combined_episodenumber><Combined_season>1.0</Combined_season></Episode></Data>', {'Content-Type': 'application/xml'})

        return tv.find('Dexter')
        .then(serie => {
          expect(serie.id).to.equal('123')
          expect(serie.name).to.equal('Dexter')
          expect(serie.episodes.length).to.equal(2)
        })
      })
    })

    context('when there is a language parameter', () => {
      it('uses it in the URL to define the language', () => {
        const englishMock = nock('http://thetvdb.com/api')
          .get('/API_KEY/series/123/all/en.xml')
          .reply('200', '<Data><Series><id>123</id></Series></Data>', {'Content-Type': 'application/xml'})

        const frenchMock = nock('http://thetvdb.com/api')
          .get('/API_KEY/series/123/all/fr.xml')
          .reply('200', '<Data><Series><id>123</id></Series></Data>', {'Content-Type': 'application/xml'})

        return tv.find('123', 'fr')
        .then(() => {
          expect(englishMock.isDone()).to.be.false
          expect(frenchMock.isDone()).to.be.true
        })
      })
    })
  })
})
