# rx-rabbitmq

> rxjs components to interact with rabbitmq message broker

Based on the RabbitMQ [tutorials](https://www.rabbitmq.com/getstarted.html), I created these rxjs observables 
to interact with the different queue and exchange types in RabbitMQ. 

I did not implement yet the RPC functionality, hopefully I can add that in a later version.

## Usage

basic queue sender:
```js
const { rabbitmq$, basicSubmitter$ } = require ('rx-rabbitmq')
- or -
const { rabbitmq$ } = require ('rx-rabbitmq/connection')
const { basicSubmitter$ } = require ('rx-rabbitmq/basic')

const { switchMap } = require ('rxjs/operators')

rabbitmq$ () // creating connection on amqp://localhost:5672
.pipe (
    switchMap (conn => basicSubmitter$ (conn, 'my_basic_queue'))
)
.subscribe ({
    next: q => {
        q.next ({ message: 'message 1' }) // send some messages 
        q.next ({ message: 'another message' })
        q.next ({ message: { name: 'mymsg', ... } }) // you can also send an object as the message, will be JSON.stringify ()'d
        q.complete () // closing the connection
    },
    complete: () => console.log ('Connection closed')
})

```

basic queue receiver:
```js
const { rabbitmq$, basicReceiver$ } = require ('rx-rabbitmq')
- or -
const { rabbitmq$ } = require ('rx-rabbitmq/connection')
const { basicReceiver$ } = require ('rx-rabbitmq/basic')

const { switchMap } = require ('rxjs/operators')

rabbitmq$ () // creating connection on amqp://localhost:5672
.pipe (
    switchMap (conn => basicReceiver$ (conn, 'my_basic_queue'))
)
.subscribe ({
    next: msg => console.log (msg.message)
})

```

topic exchange sender:
```js
const { rabbitmq$, topicSubmitter$ } = require ('rx-rabbitmq')
- or -
const { rabbitmq$ } = require ('rx-rabbitmq/connection')
const { topicSubmitter$ } = require ('rx-rabbitmq/topic')

const { switchMap } = require ('rxjs/operators')

rabbitmq$ () // creating connection on amqp://localhost:5672
.pipe (
    switchMap (conn => topicSubmitter$ (conn, 'my_topic_exchange'))
)
.subscribe ({
    next: ex => {
        ex.next ({ key: 'level1.level2.level3', message: 'message 1' }) // send some messages 
        ex.next ({ key: 'level1.anotherlevel.level3', message: { name: 'mymsg', ... } }) // you can also send an object as the message, will be JSON.stringify ()'d
        ex.complete () // closing the connection
    },
    complete: () => console.log ('Connection closed')
})

```

topic exchange receiver:
```js
const { rabbitmq$, topicReceiver$ } = require ('rx-rabbitmq')
- or -
const { rabbitmq$ } = require ('rx-rabbitmq/connection')
const { topicReceiver$ } = require ('rx-rabbitmq/topic')

const { switchMap } = require ('rxjs/operators')

rabbitmq$ () // creating connection on amqp://localhost:5672
.pipe (
    switchMap (conn => topicReceiver$ (conn, 'my_topic_exchange', 'level1.*.level3'))
)
.subscribe ({
    next: msg => console.log (`Received ${msg.message} with key ${msg.routingKey}`)
})

```

## Reactive Objects

```js
// to import all objects, you can use:
const { 
    rabbitmq$, 
    basicReceiver$, basicSubmitter$, 
    workqueueReceiver$, workqueueSubmitter$, 
    pubsubReceiver$, pubsubSubmitter$, 
    routingReceiver$, routingSubmitter$,
    topicReceiver$, topicSubmitter$
} = require ('rx-rabbitmq')

// or when you only want to import the necessary objects
const {rabbitmq$} = require ('rx-rabbitmq/connection')

const { basicSubmitter$, basicReceiver$ } = require ('rx-rabbitmq/basic')

const { workqueueSubmitter$, workqueueReceiver$ } = require ('rx-rabbitmq/workqueue')

const { pubsubSubmitter$, pubsubReceiver$ } = require ('rx-rabbitmq/pubsub')

const { routingSubmitter$, routingReceiver$ } = require ('rx-rabbitmq/routing')

const { topicSubmitter$, topicReceiver$ } = require ('rx-rabbitmq/topic')

```

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install rx-rabbitmq
```

## Acknowledgments

rx-rabbitmq was inspired by the creators of [amqp](https://www.npmjs.com/package/amqp) and the excellent getting started guide of [RabbitMQ](https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html)


## License

ISC

