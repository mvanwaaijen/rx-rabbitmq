const { Observable, Subject } = require ('rxjs')

/***
 * Defines a publish/subscribe queue. Emits a subject with which you can add messages to the exchange
 * @param {object} conn - The connection object emitted from rabbitmq$
 * @param {string} exchange - The name of the Exchange used to submit messages to
 * @returns {Subject} post messages to the Exchange by calling next () function with message object { message: 'message submitted in queue' }. Any non-string objects will be JSON.stringify()'d. A call to complete () will close the queue
 */
const pubsubSubmitter$ = (conn, exchange) => {
    return new Observable (observer => {
        conn.createChannel ((err, ch) => {
            if (err) {
                return observer.error (err)
            }
            ch.assertExchange (exchange, 'fanout', { durable: false })
            let subject = new Subject ()
            subject.subscribe({
                next: msg => {
                    if (typeof msg.message !== 'string') {
                        msg.message = JSON.stringify (msg.message)
                    }
                    ch.publish (exchange, '', new Buffer (msg.message))
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
 * Defines the receiving endpoint for a publish/subscribe exchange.
 * @param {object} conn - The connection object emitted from rabbitmq$
 * @param {string} exchange - The name of the publish/subscribe exchange to listen for messages on
 * @returns {object} message objects from queue { message: 'message submitted in queue' }
 */
const pubsubReceiver$ = (conn, exchange) => {
    return new Observable (observer => {
        conn.createChannel ((err, ch) => {
            if (err) {
                return observer.error (err)
            }
            ch.assertExchange (exchange, 'fanout', { durable: false })
            ch.assertQueue ('', { exclusive: true }, (err, q) => {
                if (err) {
                    return observer.error (err)
                }
                ch.bindQueue (q.queue, exchange, '')

                ch.consume (q.queue, msg => {
                    observer.next ({ message: `${msg.content.toString ()}` })
                }, { noAck: true })
            })
        })
    })
}

module.exports = { pubsubReceiver$, pubsubSubmitter$ }
