/*

 ----------------------------------------------------------------------------
 | ewd-redis-globals: Redis emulation of Global Storage database            |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  1 December 2016

  Redis RESP Wire Protocol implementation using ewd-netx

*/

function readResponse(tcp, timeout) {
  var crlf = '\r\n';

  function readRecord(data) {
    if (timeout) {
      var result = tcp.read({timeout: timeout});
    }
    else {
      var result = tcp.read();
    }
    //console.log('raw result: ' + JSON.stringify(result));
    if (result.ok === 0 && result.ErrorMessage) {
      tcp.disconnect();
      tcp.connect();
      //console.log('reconnected');
      return {error: result.ErrorMessage};
    }
    data = data + result.data;
    //console.log('data = ' + data + '; ' + data.substring(0, 1));
    var firstChar = data.substring(0, 1);
    var pieces;
    if (data === '+OK' + crlf) return data;
    if (firstChar === '+' || firstChar === ':') {
      return data;
    }
    if (data === '$-1' + crlf) return null;
    if (firstChar === '$') {
      //data = '*1' + crlf + data;
      //pieces = data.split(crlf);
      //pieces.shift(); // remove length indicator
      //return pieces.join(crlf);
      return data;
    }
    if (data.substring(0, 5) === '-ERR ') {
      return data;
    }

    if (data) {
      pieces = data.split(crlf);
      var noOfItems = parseInt(pieces[0].substring(1));
      //console.log('noOfItems = ' + noOfItems + '; no of pieces: ' + pieces.length);
      if (((noOfItems * 2) + 2)  !== pieces.length) {
        return readRecord(data);
      }
      else {
        //console.log('data: ' + JSON.stringify(pieces, null, 2));
        var len;
        var item;
        var itemNo;
        var totalLengthCount = 0;
        var totalItemLength = 0;
        //console.log('noOfItems = ' + noOfItems);
        for (var i = 0; i < noOfItems; i++) {
          //console.log('i = ' + i);
          itemNo = (i * 2) + 1;
          //console.log('itemNo ' + itemNo);
          len = pieces[itemNo];
          //console.log('len: ' + len);
          len = parseInt(len.toString().substring(1));
          item = pieces[itemNo + 1];
          totalLengthCount = totalLengthCount + len;
          totalItemLength = totalItemLength + item.toString().length;
          //console.log('totalLengthCount = ' + totalLengthCount);
          //console.log('totalItemLength = ' + totalItemLength);
        }
        if (totalLengthCount > totalItemLength) data = readRecord(data);
        return data;
      }
    }
    else {
      return {
        data: '',
        no: 0
      };
    }
  }

  var data = readRecord('');
  //console.log('all data read successfully: ' + data);
  if (typeof data === 'undefined' || data === null) return [null];
  if (data.error) return data;
    if (data.substring(0, 5) === '-ERR ') {
      data = data.split(crlf)[0];
      return {error: data};
    }

  var pieces = data.split(crlf);
  var firstChar = pieces[0].substring(0, 1);
  var value;
  if (data === '+OK' + crlf) return [true, 'OK'];
  if (firstChar === '$') {
    //console.log('*** $ response - ' + data);
    var pieces = data.split(crlf);
    pieces.shift(); // remove length indicator
    return pieces;
  }
  if (firstChar === '+') {
    value = pieces[0].substring(1);
    return [value];
  }
  if (firstChar === ':') {
    value = pieces[0].substring(1);
    return [parseInt(value)];
  }
  var noOfItems = parseInt(pieces[0].substring(1));
  var results = [];
  for (var i = 0; i < noOfItems; i++) {
    //console.log('pushing ' + pieces[(i * 2) + 2]);
    results.push(pieces[i * 2 + 2]);
  }
  
  return results;
}

module.exports = readResponse;