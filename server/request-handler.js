const fs = require('fs');
/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// chatterbox client index.html page
// NOTE: it has to exist & be running; see the README file to accomplish this
var htmlPagePath = '/Users/student/hrsf95-chatterbox-server/client/index.html';

var chatterboxIndexHtmlPage = null;

var setIndexPage = function(data) {
  chatterboxIndexHtmlPage = data;
  console.log('chatterboxIndexHtmlPage', chatterboxIndexHtmlPage);
};

//setIndexPage(fs.readFileSync(htmlPagePath).toString("utf-8"));
setIndexPage(fs.readFileSync(htmlPagePath));

var exports = module.exports = {};

var dataStore = {'results': [{ 'username': 'Chrystal', 'text': 'Chrystal Rocks!', 'roomname': 'Chrystalz Room' }]};

var insertIntoDataStore = function(dataObject) {
  // console.log('dataObject', dataObject);
  
  dataStore['results'].unshift(dataObject);
  console.log('dataStore', dataStore);
};

var getFromDataStore = function() {
  // TODO: way to search for specific 'record'
  return dataStore['results'].slice(1);
};

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'X-Parse-Application-Id, X-Parse-REST-API-Key, content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type' : 'application/json'
};

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  // headers['Content-Type'] = 'application/json';// ; charset=UTF-8//'text/json';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  // handle a GET
  // console.log('The request headers are now', request);
  if (request.method === 'GET') {
    if (request.url.includes('/classes/messages')) {
      response.writeHead(statusCode, headers);
      console.log('in server GET');
      
      // check to see if the client app index.html page was loaded
      if(chatterboxIndexHtmlPage !== null) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(chatterboxIndexHtmlPage);
      } else {
        // return data from the 'dataStore'
        response.end(JSON.stringify(dataStore));
      }
    } else { // for when invalid endpoint but still GET
      response.writeHead(404, headers);
      response.end('invalid endpoint ' + request.url);
    }
  } else if (request.method === 'POST' && request.url.includes('/classes/messages')) {
    let body = [];
    request.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      // store data in dataStore
      insertIntoDataStore(JSON.parse(body));
      // set status code on response
      response.writeHead(201, headers);
      // call response.end();
      response.end();
    });
  } else if (request.method === 'OPTIONS') {
    console.log('server got OPTIONS');

    // response.write('OPTIONS');
    response.writeHead(200, headers);
    // response.end('some string');
    response.end();

  } else {
    response.write('Hello, World!');

    response.end();
  }
};

exports.handleRequest = function(request) {
  
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.