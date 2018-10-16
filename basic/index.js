const { Observable, Subject } = require ('rxjs')

/***
 * Defines a basic queue. Emits a subject with which you can add messages to the queue
 * @param {object} conn - The connection object emitted from rabbitmq$
 * @param {string} queue - The name of the queue to submit messages to
 * @returns {Subject} post messages to the queue by calling next () function with message object { message: 'message submitted in queue' }. A call to complete () will close the queue
 */
const basicSubmitter$ = (conn, queue) => {
    return new Observable (observer => {
        conn.createChannel ((err, ch) => {
            if (err) {
                return observer.error (err)
            }
            ch.assertQueue (queue, { durable: false })
            let subject = new Subject ()
            subject.subscribe({
                next: msg => {
                    if (typeof msg.message !== 'string') {
                        msg.message = JSON.stringify (msg.message)
                    }
                    ch.sendToQueue (queue, new Buffer (msg.message))
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
 * Defines the endpoint for a basic queue. It receives messages from the basic queue
 * @param {object} conn - The connection object emitted from rabbitmq$
 * @param {string} queue - The name of the queue to listen for messages on
 * @returns {object} message objects from queue { message: 'message submitted in queue' }
 */
const basicReceiver$ = (conn, queue) => {
    return new Observable (observer => {
        conn.createChannel ((err, ch) => {
            if (err) {
                return observer.error (err)
            }
            ch.assertQueue (queue, { durable: false })

            ch.consume (queue, msg => {
                observer.next ({ message: `${msg.content.toString ()}`})
            }, { noAck: true })
        })
    })
}

module.exports = { basicReceiver$, basicSubmitter$ }
