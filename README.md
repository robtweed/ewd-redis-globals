# ewd-redis-globals: Redis emulation of Global Storage database
 
Rob Tweed <rtweed@mgateway.com>  
1 December 2016, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)

Special thanks to the Ripple Foundation [http://rippleosi.org  ](http://rippleosi.org) for
support and funding of this project.


## ewd-redis-globals

This module provides an emulation of a Global Storage database using Redis.

The APIs are modelled on the cache.node interface provided by the Cache database (a
proprietary Global Storage database) and are designed to behave identically.

NOTE: the APIs make use of a synchronous TCP connector: tcp-netx.  As as result, 
ewd-redis-globals cannot be used in standard Node.js applications.  It is
designed to be used in conjunction with the ewd-qoper8 module and used within 
its worker processes, where synchronous database access does not interfere with 
the main Node.js process.

See [https://robtweed.wordpress.com/2016/03/03/higher-level-database-operations-with-node-js/](https://robtweed.wordpress.com/2016/03/03/higher-level-database-operations-with-node-js/) for
further background.

Ideally ewd-redis-globals should be used with the ewd-xpress framework, 
which uses the ewd-document-store module to abstract the Global Storage as
persistent JavaScript objects and a fine-grained Document Database.

## Installation

      npm install ewd-redis-globals

## APIs

The following APIs are provided:

    open()
    close()
    get()
    set()
    data()
    increment()
    kill()
    next()
    previous()
    next_node()
    previous_node()
    lock()
    unlock()
    global_directory()
    version()

These behave and are used identically to the synchronous versions provided by the cache.node interface.  See:
[http://docs.intersystems.com/latest/csp/docbook/DocBook.UI.Page.cls?KEY=BXJS](http://docs.intersystems.com/latest/csp/docbook/DocBook.UI.Page.cls?KEY=BXJS)

## Examples

Several examples demonstrating the use of ewd-redis-globals are included in the
/examples folder.  They assume:

- you have Redis installed on the same machine as your Node.js environment
- Redis is listening on its default port: 6379
- you are using Node.js version 6.x

In addition to basic API tests, you can also see how the ewd-document-store
module provides a high-level abstraction of ewd-redis-global's Global Storage 
as:

- persistent JavaScript Objects
- document database

See /examples/docstore-tests.js

For more information on ewd-document-store, see:

[http://gradvs1.mgateway.com/download/ewd-document-store.pdf](http://gradvs1.mgateway.com/download/ewd-document-store.pdf)


## Configuring ewd-redis-globals

You can provide an optional argument when instantiating ewd-redis-globals.  For example, 
if you're running it on a Raspberry Pi with Node.js version 6.x:

      var redis_globals = require('ewd-redis-globals');
      var db = new redis_globals({
        node_version: 'rpi'
      });

If you're running Redis on a different machine and non-standard port:

      var redis_globals = require('ewd-redis-globals');
      var db = new redis_globals({
        host: '192.168.1.100',
        port: 3009
      });

## Current Limitations

The current version of ewd-redis-globals will currently only run on:

- Linux machines with Node.js version 6.x
- Raspberry Pi with Node.js version 6.x

More platforms will become available soon


## License

 Copyright (c) 2016 M/Gateway Developments Ltd,                           
 Reigate, Surrey UK.                                                      
 All rights reserved.                                                     
                                                                           
  http://www.mgateway.com                                                  
  Email: rtweed@mgateway.com                                               
                                                                           
                                                                           
  Licensed under the Apache License, Version 2.0 (the "License");          
  you may not use this file except in compliance with the License.         
  You may obtain a copy of the License at                                  
                                                                           
      http://www.apache.org/licenses/LICENSE-2.0                           
                                                                           
  Unless required by applicable law or agreed to in writing, software      
  distributed under the License is distributed on an "AS IS" BASIS,        
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
  See the License for the specific language governing permissions and      
   limitations under the License.      
