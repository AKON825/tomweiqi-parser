# sinagibo-parser
---
棋聖道場, tom棋譜(http://weiqi.tom.com/php/listqipu.html) 的截取parser
用以抓取
單頁清單的所有棋譜連結('http://weiqi.tom.com/php/listqipu_02.html')
單頁棋譜的內容(http://weiqi.sports.tom.com/2017-01-09/004O/06832763.html)
tom棋譜的所有頁面清單(2017-1-25時約有49頁, 一頁延遲一秒, 須等待)

## Install

透過NPM安裝套件

```sh
$ npm install
```

##  Use
各function使用方式
```sh

var tomWeiqiParser = require('tomweiqi-parser');

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


```
