// ESM
import fastifyCors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import Fastify from 'fastify';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { Resend } from 'resend';

const fastify = Fastify({
    logger: true
});

//Define schema for validation
const schema = {
    type: 'object',
    required: ['PORT', 'RESEND_CONTACT_API_KEY', 'RESEND_ORDER_API_KEY', 'MERCADO_PAGO_ACCESS_TOKEN'],
    properties: {
        PORT: {
            type: 'string',
            default: '3000'
        },
        RESEND_CONTACT_API_KEY: {
            type: 'string'
        },
        RESEND_ORDER_API_KEY: {
            type: 'string'
        },
        MERCADO_PAGO_ACCESS_TOKEN: {
            type: 'string'
        }
    }
};

// Define options for validation
const options = {
    confKey: 'config',
    schema: schema,
    dotenv: true
};


await fastify.register(fastifyEnv, options);

// Wait for the ready event before starting the server
await fastify.after();

const allowedOrigins = fastify.config.NODE_ENV === 'production' ? ['https://colombiatodo.com', 'https://www.colombiatodo.com'] : ['http://localhost:3000'];

fastify.register(fastifyCors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
})

// Initialize env variables
const resendContact = new Resend(fastify.config.RESEND_CONTACT_API_KEY);
const resendOrder = new Resend(fastify.config.RESEND_ORDER_API_KEY);
const clientMercadoPago = new MercadoPagoConfig({ accessToken: fastify.config.MERCADO_PAGO_ACCESS_TOKEN });

// Routes
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

// Order Form Submission
fastify.post('/order', async (request, reply) => {
    const body = request.body;
    const { order, shippingData } = body.body;
    const { email } = shippingData
    try {
        const { data, error } = await resendOrder.emails.send({
            from: "Colombiatodo CI SAS <pedidos@colombiatodo.com>",
            to: [email],
            subject: `Orden ColombiaTodo CI SAS`,
            html: `
            <h1>Orden ColombiaTodo CI SAS</h1>
            <p>Gracias por tu orden, en breve nos comunicaremos contigo para confirmar tu orden.</p>
            <p>Orden: ${order}</p>
            `
        });
        if (error) {
            return reply.status(500).send({
                message: 'Error sending email',
                error: error
            });
        }

        return reply.status(200).send({
            message: 'Order sent successfully',
            data: { data, success: true }
        });

    } catch (error) {
        return reply.status(500).send({
            message: 'Error sending order',
            error: error
        });
    }
})

// MercadoPago Create Preference
fastify.post('/create-preference', async (request, reply) => {
    const reqBody = request.body;
    const { items } = reqBody.body;
    const { cartItems, deliveryCompany } = items;

    const cart = cartItems.map(({ title, quantity, price, image }) => ({
        title: title,
        quantity: quantity,
        unit_price: +price,
        picture_url: image
    }))

    const delivery = {
        title: deliveryCompany.title,
        quantity: 1,
        unit_price: Math.round(+deliveryCompany.price)
    }

    const itemsBody = [...cart, delivery];

    const body = {
        items: itemsBody,
        back_urls: {
            success: `${process.env.NEXT_PUBLIC_TUNNEL_URL}payment/success`,
            pending: process.env.NEXT_PUBLIC_TUNNEL_URL,
            failure: process.env.NEXT_PUBLIC_TUNNEL_URL,
        },
        auto_return: "approved",
    }

    try {
        const preference = new Preference(clientMercadoPago);
        const result = await preference.create({ body });
        return reply.status(200).send({
            id: result.id,
        });
    } catch (error) {
        return reply.status(500).send({
            message: 'Error creating preference',
            error: error
        });
    }
})

/**
 * Inicia el servidor después de que las rutas se hayan definido
 */
const start = async () => {
    try {
        await fastify.listen({ 
            port: fastify.config.PORT,
            host: '0.0.0.0'
        });
        console.log(`Server listening on port ${fastify.config.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
