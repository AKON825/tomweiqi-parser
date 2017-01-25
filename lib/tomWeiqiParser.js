module.exports = TomWeiqiParser

var path = require('path')
var async = require('async')
var request = require('request')
var cheerio = require('cheerio')
var iconv = require('iconv-lite')
var moment = require('moment')

function TomWeiqiParser () {
  if (!(this instanceof TomWeiqiParser)) {
    return new TomWeiqiParser()
  }

  /**
   * 取得新浪棋譜的所有頁面list
   *
   * @param {string} pageUrl
   * @param {Function} cb
   * @returns {object}
   */
  this.getAllPagesList = function (cb) {
    // 第一頁棋譜頁面
    var pageList = [
      'http://weiqi.tom.com/php/listqipu.html'
    ]

    //http://weiqi.tom.com/php/listqipu_40.html
    var pageNum = '02'
    //var pageNum = '40'
    var continueErrCount = 0

    var hasNoNextPage = false
    return async.whilst(
      function() { return hasNoNextPage == false; },
      function(asyncCb) {
        return findQipuList(pageNum, function(err, isEmptyPage){
          if(err) {
            // 出錯計數器+1
            continueErrCount = continueErrCount + 1
            return nextRound()
          } else {
            // 沒出錯把err技術歸零
            continueErrCount = 0
          }

          if (isEmptyPage){
            hasNoNextPage = true
          }

          // 轉為int後+1, 再轉回字串
          pageNum = parseInt(pageNum, 10) + 1;

          if(pageNum < 10) {
            pageNum = '0' + pageNum.toString()
          } else {
            pageNum = pageNum.toString()
          }

          return nextRound()

          function nextRound() {
            if(continueErrCount >= 5) {
              return asyncCb(new Error('截取頁面清單錯誤超過次數'))
            }
            // 一秒後再操作下一輪
            return setTimeout(function() {
              return asyncCb()
            }, 1000);
          }
        })

      },
      function (err) {
        if(err) {
          return cb(err)
        }

        // 舊的固定棋譜頁面
        var oldList = [
          'http://weiqi.sports.tom.com/php/listqipu2012.html',
          'http://weiqi.sports.tom.com/php/listqipu2011.html',
          'http://weiqi.sports.tom.com/php/listqipu2010.html',
          'http://weiqi.sports.tom.com/php/listqipu2009.html',
          'http://weiqi.sports.tom.com/php/listqipu2008.html',
          'http://weiqi.sports.tom.com/php/listqipu2007.html',
          'http://weiqi.sports.tom.com/php/listqipu2006.html',
          'http://weiqi.sports.tom.com/php/listqipu2005.html',
          'http://weiqi.sports.tom.com/php/listqipu2000.html'
        ]

        pageList = pageList.concat(oldList)

        return cb(null, pageList)
      }
    )

    // return findQipuList('02', function(){
    //   logger.info('done')
    // })

    function findQipuList(pageNum, cb) {
      return request({
        url: 'http://weiqi.tom.com/php/listqipu_' + pageNum + '.html',
        //禁止使用預設編碼
        encoding: null
      }, function (error, response, body) {
        if (error) {
          return cb(error)
        }

        if(response.statusCode != 200) {
          return cb(new Error('頁面截取失敗'))
        }

        if (!error && response.statusCode == 200) {
          var body = iconv.decode(body, 'GBK');
          var $ = cheerio.load(body)

          // tom棋譜頁面區段
          var ul = $('.courselist ul')
          var hrefAs = ul.find('li.a a')
          var href = hrefAs.eq(0).attr('href')

          var isEmptyPage = false

          if(hrefAs.length == 0) {
            // 沒有此頁資料

            isEmptyPage = true
          } else {
            pageList.push('http://weiqi.tom.com/php/listqipu_' + pageNum + '.html')
          }

          return cb(null, isEmptyPage)
        }
      })
    }


  }

  /**
   * 抓一頁標題清單頁中的標題和連結
   *
   * @param {string} pageUrl
   * @param {Function} cb
   * @returns {object}
   */
  this.getTitleList = function (pageUrl, cb) {
    return request({
      url: pageUrl,
      //禁止使用預設編碼
      encoding: null
    }, function (error, response, body) {
      if (error) {
        return cb(error.message)
      }

      if (response.statusCode != 200) {
        return cb('網頁失效')
      }

      var body = iconv.decode(body, 'GBK');
      var $ = cheerio.load(body)

      var titleObjList = []

      // tom棋譜頁面區段
      var ul = $('.courselist ul')

      for (var i = 1; i < ul.length; i++) {
        var title = ul.eq(i).find('li.a a').text()
        var date = ul.eq(i).find('li.b').text()
        date = moment(new Date(date)).format('YYYY-MM-DD')

        var href = ul.eq(i).find('li.a a').attr('href')
        if(href) {
          href = href.replace(/.*newwindow\(\'(.*)\'\)/g, '$1')
        }

        var titleObj = {
          title: title,
          href: href,
          date: date
        }

        titleObjList.push(titleObj)
      }

      // logger.info(titleObjList)
      // return
      return cb(null, titleObjList)
    })
  }

  /**
   * 抓一頁的棋譜
   *
   * @param {string} pageUrl
   * @param {Function} cb
   * @returns {object}
   */
  this.getPageChess = function (pageUrl, cb) {
    return request({
      url: pageUrl,
      //禁止使用預設編碼
      encoding: null
    }, function (error, response, body) {
      if (error) {
        return cb(error)
      }

      if(response.statusCode != 200) {
        return cb(error)
      }

      var body = iconv.decode(body, 'GBK');
      var $ = cheerio.load(body)

      //tom棋譜內容片段
      var scriptText = $('script').text()
      var sgf = scriptText.replace(/[^]*sgf:"([^\"]*)[^]*/g, '$1')
      //logger.info(sgf)

      //(;WR[二段]BR[四段]US[TOM围棋]PW[崔宰荣]PC[]RE[黑中盘胜]
      //DT[2017-01-11]SO[http://tomwq.tom.com/]RU[Japanese]EV[第2届世界未来之星新锐赛8强赛]PB[韩升周]KM[6.50]

      var pb = sgf.replace(/.*PB\[([^\]]*)\].*/g, '$1')
      var pw = sgf.replace(/.*PW\[([^\]]*)\].*/g, '$1')
      var br = sgf.replace(/.*BR\[([^\]]*)\].*/g, '$1')
      var wr = sgf.replace(/.*WR\[([^\]]*)\].*/g, '$1')
      var dt = sgf.replace(/.*DT\[([^\]]*)\].*/g, '$1')
      var ev = sgf.replace(/.*EV\[([^\]]*)\].*/g, '$1')
      var re = sgf.replace(/.*RE\[([^\]]*)\].*/g, '$1')
      var date = moment(new Date(dt)).format('YYYY-MM-DD')
      // 判斷是否正確sgf

      var contentObj = {
        title: ev,
        content: sgf,
        url: pageUrl,
        black_level: br,
        white_level: wr,
        black_name: pb,
        white_name: pw,
        chess_result: re,
        date: date,
      }

      return cb(null, contentObj)
    })
  }

}
