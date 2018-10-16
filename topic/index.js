const { Observable, Subject } = require ('rxjs')

/***
 * Defines a Topic Exchange. Emits a subject with which you can add messages to the exchange
 * @param {object} conn - The connection object emitted from rabbitmq$
 * @param {string} exchange - The name of the Exchange used to submit messages to
 * @returns {Subject} post messages to the Exchange by calling next () function with message object { key: 'routing_key', message: 'message submitted in queue' }. 
 *                    Any non-string objects will be JSON.stringify()'d. A call to complete () will close the queue
 */
const topicSubmitter$ = (conn, exchange) => {
    return new Observable (observer => {
        conn.createChannel ((err, ch) => {
            if (err) {
                return observer.error (err)
            }
            ch.assertExchange (exchange, 'topic', { durable: false })
            let subject = new Subject ()
            subject.subscribe({
                next: msg => {
                    if (typeof msg.message !== 'string') {
                        msg.message = JSON.stringify (msg.message)
                    }
                    ch.publish (exchange, msg.key, new Buffer (msg.message))
                },
                error: err => {
                    conn.close ()
                    console.log (`Subject received error: ${err}`)
                    observer.error (err)
                },
                complete: () => {
                    conn.close ()
                    console.log ('connection closed')
                    observer.complete ()
                }
            })
            observer.next (subject)
        })
    })
}

/***
 * Defines the receiving endpoint for a Topic Exchange.
 * @param {object} conn - The connection object emitted from rabbitmq$
 * @param {string} exchange - The name of the publish/subscribe exchange to listen for messages on
 * @param {(string|string[])} keys - string or array of strings for topic keys to listen for (dot-separated strings, * = matches exactly one keyword, # = matches any number of keywords)
 * @returns {object} message objects from queue { routingKey: 'routing_key', message: 'message submitted in queue' }
 */
const topicReceiver$ = (conn, exchange, keys) => {
    let _keys = []
    if (typeof keys === 'string') {
        _keys.push (keys)
    } else if (Array.isArray (keys)) {
        _keys = keys
    } else {
        throw new Error ('Invalid keys object. should be either string or array of strings')
    }

    return new Observable (observer => {
        conn.createChannel ((err, ch) => {
            if (err) {
                return observer.error (err)
            }
            ch.assertExchange (exchange, 'topic', { durable: false })
            ch.assertQueue ('', { exclusive: true }, (err, q) => {
                if (err) {
                    return observer.error (err)
                }
                _keys.forEach (key => {
                    ch.bindQueue (q.queue, exchange, key)
                })

                ch.consume (q.queue, msg => {
                    observer.next ({ routingKey: `${msg.fields.routingKey}`, message: `${msg.content.toString ()}` })
                }, { noAck: true })
            })
        })
    })
}

module.exports = { topicReceiver$, topicSubmitter$ }
