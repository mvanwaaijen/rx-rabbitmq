const amqp = require ('amqplib/callback_api')
const { Observable } = require ('rxjs')

/***
 * Makes a connection to a RabbitMQ message broker server
 * @param {string} [host] - The optional name of the server. "localhost" and standard port 5672 is assumed when omitted
 * @returns {object} returns the rabbitmq (amqp) connection object, which is needed as input parameter for the emitters/receivers to listen/send.
 */
const rabbitmq$ = (host) => {
    return new Observable (observer => {
        if (host === null || host === undefined) {
            host = 'localhost'
        }
        amqp.connect (`amqp://${host}`, (err, conn) => {
            if (err) {
                return observer.error (err)
            }
            return observer.next (conn)
        })
    })
}

module.exports = { rabbitmq$ }
