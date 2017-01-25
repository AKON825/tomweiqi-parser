var tomWeiqiParser = require('./index')

var url = 'http://weiqi.tom.com/php/listqipu_02.html'

tomWeiqiParser.getTitleList(url, function(err, titleObjList){
	console.log(err)
	console.log('getTitleList 取得此頁所有的棋譜連結清單')
	console.log(titleObjList)
})

url = 'http://weiqi.sports.tom.com/2017-01-09/004O/06832763.html'

tomWeiqiParser.getPageChess(url, function(err, contentObj){
	console.log(err)
	console.log('getTitleList 取得tom棋譜連結的內容')
	console.log(contentObj)
})

tomWeiqiParser.getAllPagesList(function(err, pageList){
	console.log(err)
	console.log('getAllPagesList 取得tom棋譜的所有頁面清單')
	console.log(pageList)
})
