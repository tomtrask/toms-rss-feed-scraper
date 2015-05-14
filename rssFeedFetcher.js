var feedFolder = 'data/'

// prefer public URLs but we can use the iTunes link for now
var feeds = {
  onmarkRSS: {
    name:'onmarkRss',
    url:'https://onmarkservices.com/onmarksite/content/rss/?uid=f00d0ff2'
  },
  patEd: {
    name:'patientEducation',
    url:'https://onmarkservices.com/onmarksite/content/rss/rss1.jsp?section=All/Patient Education&uid=f00d0ff2'
  }
}

var feeds0 = {
  startalk:{
    name:'starTalkRadio',
    url:'http://feeds.soundcloud.com/users/soundcloud:users:38128127/sounds.rss'
  }
}

var fs = require('fs')
var http = require('http')
var https = require('https')
var url = require('url')

var fetchContent = function(urlStr, callback) {
  var parse = url.parse(urlStr)
  /*
  callback(new Error('not ready yet'))
  return
  var fullOptions = {
    hostname:server,
    path:path,
    port:443,                         // https
    secureProtocol:'TLSv1_method',    // https
    rejectUnauthorized:false,         // https
    method:'GET'
  }
  */

  var result = ''
  var isHttps = parse.protocol === 'https:'
  var protHandler = isHttps ? https : http
  if (isHttps) {
    parse.port=443
    // the next two lines are about accepting questionable stuff
    parse.secureProtocol='TLSv1_method'
    parse.rejectUnauthorized=false
  }

  var req = protHandler.request(parse, function(res){
    res.on('data', function(d) {
      result += d
    })

    res.on('end', function(){
      callback(null,result)
    })
    res.on('error', function(e){
      callback(e)
    })
  })
  //  we have to call req.end to actually flush the request across the wire
  req.end()

  req.on('close', function(x) {
    console.log('closed?:  '+result.length)
    callback(null,result)
  })

  req.on('error', function(err) {
    console.log('error path: '+err)
    callback(err)
  })
}


if (!fs.existsSync(feedFolder)) {
  console.log('creating feedFolder at '+feedFolder)
  fs.mkdirSync(feedFolder)
}

for (var feedId in feeds) {
  var feed = feeds[feedId]
  console.log(feedId)
  var rssFeedFileName = feedFolder+feed.name+'.xml'
  fetchContent(feed.url, (function(where) {
    return function(err,res) {
      if (err) {
        console.log('no dice: '+err)
      } else {
        console.log('done with '+where)
        if (fs.existsSync(where)) {
          fs.unlinkSync(where)
        }
        fs.writeFileSync(where, res, {encoding:'utf8'})
      }
    }})(rssFeedFileName))
}
