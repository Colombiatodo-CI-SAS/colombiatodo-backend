// ESM
import fastifyEnv from '@fastify/env';
import Fastify from 'fastify';
import { Resend } from 'resend';

const fastify = Fastify({
    logger: true
});

const schema = {
    type: 'object',
    required: ['PORT', 'RESEND_CONTACT_API_KEY'],
    properties: {
        PORT: {
            type: 'string',
            default: '3000'
        },
        RESEND_CONTACT_API_KEY: {
            type: 'string'
        }
    }
};

const options = {
    confKey: 'config',
    schema: schema,
    dotenv: true
};

await fastify.register(fastifyEnv, options);

// Espera hasta que `fastifyEnv` cargue las variables
await fastify.after();

// Inicializa `resendContact` después de cargar las variables de entorno
const resendContact = new Resend(fastify.config.RESEND_CONTACT_API_KEY);

// Definición de rutas
fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
});

// Contact Form Submission
fastify.post('/contact', async (request, reply) => {
    const body = request.body;
    const { name, email } = body.body;
    try {
        const { data, error } = await resendContact.emails.send({
            from: "Colombiatodo CI SAS <contacto@colombiatodo.com>",
            to: [email],
            subject: `Contacto ColombiaTodo CI SAS`,
            html: `${name}, gracias por contactarnos, nos comunicaremos contigo a la brevedad posible.`
        });

        if (error) {
            return reply.status(500).send({
                message: 'Error sending email',
                error: error
            });
        }
        return reply.status(200).send({
            message: 'Email sent successfully',
            data: { data, success: true }
        });

    } catch (error) {
        return reply.status(500).send({
            message: 'Error sending email',
            error: error
        });
    }
});



/**
 * Inicia el servidor después de que las rutas se hayan definido
 */
const start = async () => {
    try {
        await fastify.listen({ port: fastify.config.PORT });
        console.log(`Server listening on port ${fastify.config.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
