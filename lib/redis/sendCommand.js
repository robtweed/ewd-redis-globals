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

function sendRedisCommand(command, args, tcp) {
  args = args || [];
  var crlf = '\r\n';
  var noOfCommands = args.length + 1;
  var request = '*' + noOfCommands + crlf + '$' + command.length + crlf + command + crlf;
  args.forEach(function(arg) {
    request = request + '$' + arg.toString().length + crlf + arg + crlf;
  }); 
  var payload = {
    data: request
  }
  //console.log('sending request: ' + JSON.stringify(payload));
  tcp.write(payload);
}

module.exports = sendRedisCommand;
