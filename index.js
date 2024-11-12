// ESM
import fastifyCors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import Fastify from 'fastify';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { Resend } from 'resend';
import contactTemplate from './emails/contactTemplate.js';
import OrderMailTemplate from './emails/orderTemplate.js';

const fastify = Fastify({
    logger: true
});

//Define schema for validation
const schema = {
    type: 'object',
    required: ['PORT', 'RESEND_CONTACT_API_KEY', 'RESEND_ORDER_API_KEY', 'MERCADO_PAGO_ACCESS_TOKEN', 'NODE_ENV', 'FRONT_END_TUNNEL'],
    properties: {
        PORT: {
            type: 'string',
            default: '4000'
        },
        RESEND_CONTACT_API_KEY: {
            type: 'string'
        },
        RESEND_ORDER_API_KEY: {
            type: 'string'
        },
        MERCADO_PAGO_ACCESS_TOKEN: {
            type: 'string'
        },
        NODE_ENV: {
            type: 'string'
        },
        FRONT_END_TUNNEL: {
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

const allowedOrigins = fastify.config.NODE_ENV === 'production' ? ['https://colombiatodo.com', 'https://www.colombiatodo.com'] : ['http://localhost:3000', fastify.config.FRONT_END_TUNNEL];


const backUrl = fastify.config.NODE_ENV === 'production' ? "https://colombiatodo.com/" : fastify.config.FRONT_END_TUNNEL;

fastify.register(fastifyCors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Accept', 'Content-Type', 'Authorization'],
    credentials: true,
});

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
    const { name, email } = body;
    try {
        const { data, error } = await resendContact.emails.send({
            from: "Colombiatodo CI SAS <contacto@colombiatodo.com>",
            to: [email],
            subject: `Contacto ColombiaTodo CI SAS`,
            html: contactTemplate(body)
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
    const { order, shippingData } = body;
    const { email } = shippingData
    try {
        const { data, error } = await resendOrder.emails.send({
            from: "Colombiatodo CI SAS <pedidos@colombiatodo.com>",
            to: [email],
            subject: `Orden ColombiaTodo CI SAS`,
            html: OrderMailTemplate(order)
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
    const { items } = reqBody
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
            success: `${backUrl}payment/success`,
            pending: backUrl,
            failure: backUrl,
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

fastify.post('/payment', async (request, reply) => {
    console.log("Post payment");
    const body = request.body;

    const { paymentId } = body;

    try {
        const payment = await new Payment(clientMercadoPago).get({ id: paymentId });

        // Guarda el pedido en la base de datos y envía un correo con el resumen del pedido aquí
        // ...

        return reply.status(200).send({
            message: 'Payment received successfully',
            data: { payment, success: true }
        });
    } catch (error) {
        console.error('Error fetching payment: ', error);
        return reply.status(500).send({
            message: 'Error fetching payment',
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
