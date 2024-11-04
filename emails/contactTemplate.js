export default function contactTemplate(contactData) {
    const { name, email, company, country, topic, message } = contactData;
    return `
            <div>
            <main>
                <h2>Hola, ${name}</h2>
                <p>Gracias por contactarnos. Hemos recibido tu solicitud y te responderemos lo antes posible.</p>
                <div>
                    <h3>Detalles de tu contacto:</h3>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Correo Electrónico:</strong> ${email}</p>
                    <p><strong>Empresa:</strong> ${company || "No especificada"}</p>
                    <p><strong>País:</strong> ${country}</p>
                    <p><strong>Asunto:</strong> ${topic}</p>
                    <p><strong>Requerimiento:</strong> ${message}</p>
                </div>
                <p>Nos pondremos en contacto contigo a la brevedad.</p>
                <p>Saludos cordiales,<br />El equipo de Colombiatodo CI SAS</p>
            </main>
            <footer>
                <p>&copy; ${new Date().getFullYear()} Colombiatodo CI SAS. Todos los derechos reservados.</p>
            </footer>
        </div>
    `;

}