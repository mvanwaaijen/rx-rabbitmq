const { rabbitmq$ } = require ('./connection')
const { topicReceiver$, topicSubmitter$ } = require ('./topic')
const { basicReceiver$, basicSubmitter$ } = require ('./basic')
const { workqueueReceiver$, workqueueSubmitter$ } = require ('./workqueue')
const { pubsubReceiver$, pubsubSubmitter$ } = require ('./pubsub')
const { routingReceiver$, routingSubmitter$ } = require ('./routing')


module.exports = { 
    rabbitmq$, 
    topicReceiver$, topicSubmitter$, 
    basicReceiver$, basicSubmitter$, 
    workqueueReceiver$, workqueueSubmitter$, 
    pubsubReceiver$, pubsubSubmitter$,
    routingReceiver$, routingSubmitter$
}
