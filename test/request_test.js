'use strict'

const chai            = require('chai'),
      chaiAsPromised  = require('chai-as-promised'),
      expect          = chai.expect,
      nock            = require('nock'),
      request         = require('../lib/request')

chai.use(chaiAsPromised)

describe('Request', () => {
  it("rejects the promise if the 'seriesname' attribute if blank", () => {
    const mock = nock('http://thetvdb.com/api')
      .get('/GetSeries.php?seriesname=')
      .reply('200', '<Error>seriesname is required</Error>', { 'Content-Type': 'application/xml' })

    const promise = request('http://thetvdb.com/api/GetSeries.php?seriesname=')
    return promise.catch((err) => {
      expect(mock.isDone()).to.be.true
      expect(err).to.equal('The name or the ID of the serie is required')
    })
  })

  it("rejects the promise if the server responded with an empty 'Data' object", () => {
    const mock = nock('http://thetvdb.com/api')
      .get('/GetSeries.php?seriesname=abcdef')
      .reply('200', '<Data></Data>', { 'Content-Type': 'application/xml' })

    const promise = request('http://thetvdb.com/api/GetSeries.php?seriesname=abcdef')
    return promise.catch((err) => {
      expect(mock.isDone()).to.be.true
      expect(err).to.equal('Serie was not found')
    })
  })

  it('rejects the promise if the server returned 404 (most likely an invalid api key', () => {
    const mock = nock('http://thetvdb.com/api')
      .get('/123/series/456/all/en.xml')
      .reply('404')

    const promise = request('http://thetvdb.com/api/123/series/456/all/en.xml')
    return promise.catch((err) => {
      expect(mock.isDone()).to.be.true
      expect(err).to.equal('Your API key is invalid')
    })
  })

  it("resolves the promise if the server responded with a valid 'Serie' object", () => {
    const mock = nock('http://thetvdb.com/api')
      .get('/GetSeries.php?seriesname=Dexter')
      .reply('200', '<Data><Series><id>123456</id><seriesname>Dexter</seriesname></Series></Data>', { 'Content-Type': 'application/xml' })

    const promise = request('http://thetvdb.com/api/GetSeries.php?seriesname=Dexter')
    return promise.then((serie) => {
      expect(mock.isDone()).to.be.true
      expect(serie.id).to.equal('123456')
      expect(serie.name).to.equal('Dexter')
    })
  })
})
