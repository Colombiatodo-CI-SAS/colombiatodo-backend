// ESM
import Fastify from 'fastify'

const fastify = Fastify({
    logger: true
})

fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
})

//Contact Form Submission
fastify.post('/contact', async (request, reply) => {
    const body = request.body
    const { name, email, phone, company, country, topic, message } = body
    return { contactInfo: body }
})

/**
 * Run the server!
 */
const start = async () => {
    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()