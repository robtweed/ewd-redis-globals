# ewd-redis-globals: Redis emulation of Global Storage database
 
Rob Tweed <rtweed@mgateway.com>  
1 December 2016, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)

Special thanks to the Ripple Foundation [http://rippleosi.org  ](http://rippleosi.org) for
support and funding of this project.


## ewd-redis-globals

This module provides an emulation of a Global Storage database using Redis.

The APIs are modelled on the *cache.node* interface provided by the Cach&eacute; database (a
proprietary Global Storage database) and are designed to behave identically.

NOTE: the APIs make use of a synchronous TCP connector: [*tcp-netx*](https://github.com/chrisemunt/tcp-netx).  It is
designed to be used in conjunction with the [ewd-qoper8](https://github.com/robtweed/ewd-qoper8) module and used within 
its worker processes, where synchronous database access does not interfere with 
the main Node.js process, rather than in conventional Node.js-based applications.

See [https://robtweed.wordpress.com/2016/03/03/higher-level-database-operations-with-node-js/](https://robtweed.wordpress.com/2016/03/03/higher-level-database-operations-with-node-js/) for
further background.

Ideally *ewd-redis-globals* should be used with the [*ewd-xpress*](https://github.com/robtweed/ewd-xpress) framework, 
which uses the [*ewd-document-store*](https://github.com/robtweed/ewd-document-store) module to abstract the 
Global Storage as something
uniquely powerful: persistent JavaScript objects and a fine-grained Document Database.


## Installation

Before installing *ewd-redis-globals*, you must first install *tcp-netx*.  Read its 
[installation instructions](https://github.com/chrisemunt/tcp-netx) carefully as it requires a C++ compiler to
be present on your system before it can build.  Assuming you've done this:

      npm install tcp-netx


Then install ewd-redis-globals:


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

Several examples demonstrating the use of *ewd-redis-globals* are included in the
*/examples* folder.  They assume:

- you have Redis installed on the same machine as your Node.js environment
- Redis is listening on its default port: 6379
- you are using Node.js version 6.x

In addition to basic API tests, you can also see how the *ewd-document-store*
module provides a high-level abstraction of *ewd-redis-global's* Global Storage 
as:

- persistent JavaScript Objects
- document database

See /examples/docstore-tests.js

For more information on ewd-document-store, see:

[http://gradvs1.mgateway.com/download/ewd-document-store.pdf](http://gradvs1.mgateway.com/download/ewd-document-store.pdf)

You'll also find a detailed set of presentations on Global Storage databases and the 
ewd-document-store JavaScript abstraction on the M/Gateway Web Site: go to:

      [http://www.mgateway.com](http://www.mgateway.com)

Click the *Training* tab.  Parts 17 to 27 will provide in-depth background.  *ewd-redis-globals* will behave
identically to the other Global Storage databases referred to in these presentations.


## Configuring ewd-redis-globals

You can provide an optional argument when instantiating *ewd-redis-globals*.  For example, 
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

## How Global Storage is Emulated in ewd-redis-globals

To understand the basics of a Global Storage database, see 

[http://www.slideshare.net/robtweed/ewd-3-training-course-part-17-introduction-to-global-storage-databases](http://www.slideshare.net/robtweed/ewd-3-training-course-part-17-introduction-to-global-storage-databases)

The hierarchical structure of a Global is emulated using three sets of Redis keys:

- node:xxxx  A hash that contains details about each Global Node, specifically whether it's a leaf-node
 or not, and if so, its value

- children:xxxx  A sorted list containing any child subscript values for each of a Global's nodes

- leaves:xxxx  A sorted list containing pointers to the node: keys for leaf nodes only

A global node key (xxxx) is constructed from the Global name and its Subscripts.  They are flattened into
a singe string using Hex 01 as a delimiter.  For example the Global Node:

      rob("a","b","c")

would be represented as:

      rob\x01a\x01b\x01\c

In order to emulate the subscript collating order of Global Storage database, integer subscript values
are padded out with up to 9 leading zeros within the children:xxxx sorted lists.

The Lock and Unlock commands are emulated using the Redis Blocking Pop command BLPOP and use two additional 
simple keys:

- lock:xxxx  Representing the Global Node that is locked
- locker: xxxx  Representing the process locking the node


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
