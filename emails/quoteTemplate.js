export default function QuoteNameTemplate(quoteData) {
    const {
        name,
        email,
        phone,
        product,
        quantity,
        comments
    } = quoteData
    return `
    <section>
    <header>
        <h2>Colombiatodo CI SAS</h2>
        <p>Gracias por tu solicitud de cotización. La revisaremos y te daremos una respuesta lo más pronto posible</p>
    </header>
        <article>
            <h2>Solicitud de Cotización</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Producto:</strong> ${product}</p>
            <p><strong>Cantidad:</strong> ${quantity}</p>
            <p><strong>Comentarios:</strong> ${comments || "No hay comentarios adicionales"}</p>
        </article>
        <footer>
                <p>&copy; ${new Date().getFullYear()} Colombiatodo CI SAS. Todos los derechos reservados.</p>
        </footer>
    </section>
`;
}