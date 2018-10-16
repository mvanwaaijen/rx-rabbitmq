const { Observable, Subject } = require ('rxjs')

/***
 * Defines a work queue. Emits a subject with which you can add messages to the queue
 * @param {object} conn - The connection object emitted from rabbitmq$
 * @param {string} queue - The name of the queue to submit messages to
 * @returns {Subject} post messages to the queue by calling next () function with message object { message: 'message submitted in queue' }. A call to complete () will close the queue
 */
const workqueueSubmitter$ = (conn, queue) => {
    return new Observable (observer => {
        conn.createChannel ((err, ch) => {
            if (err) {
                return observer.error (err)
            }
            ch.assertQueue (queue, { durable: true })
            let subject = new Subject ()
            subject.subscribe({
                next: msg => {
                    if (typeof msg.message !== 'string') {
                        msg.message = JSON.stringify (msg.message)
                    }
                    ch.sendToQueue (queue, new Buffer (msg.message), { persistent: true })
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
 * Defines the endpoint for a work queue. It receives messages from the work queue
 * @param {object} conn - The connection object emitted from rabbitmq$
 * @param {string} queue - The name of the queue to listen for messages on
 * @param {number} [prefetchCount=1] - The max number of messages the client can receive at a time (before calling ack())
 * @returns {object} message objects from queue { message: 'message submitted in queue', ack: function for acknowledgement }. When done processing work, call msg.ack () to acknowledge the message
 */
const workqueueReceiver$ = (conn, queue, prefetchCount) => {
    if (prefetchCount === undefined || prefetchCount === null) {
        prefetchCount = 1
    }
    return new Observable (observer => {
        conn.createChannel ((err, ch) => {
            if (err) {
                return observer.error (err)
            }
            ch.assertQueue (queue, { durable: true })
            ch.prefetch (prefetchCount)

            ch.consume (queue, msg => {
                observer.next ({ message: `${msg.content.toString ()}`, ack: function () {
                    ch.ack (msg)
                    console.log ('acknowledged')
                }})
            }, { noAck: false })
        })
    })
}

module.exports = { workqueueReceiver$, workqueueSubmitter$ }
