export default function OrderMailTemplate(order) {
    const {
        status,
        dateApproved,
        transactionAmount,
        paymentMethod,
        card,
        payer,
        items,
        paymentId,
    } = order;

    const orderItems = items.map((item, index) => {
        return `
        <li>
            <img src=${item.picture_url} alt=${item.title} />
            ${item.title} - ${item.quantity} x ${item.unit_price.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
            })}
        </li>
        `
    }
    )

    return `
    <div>
            <header>
                <p>
                    <strong>Aprobado:</strong> ${new Date(dateApproved).toLocaleDateString()}
                </p>
            </header>
            <h2>Tu pago ha sido exitoso</h2>
            <p>Gracias por tu pedido, estamos procesándolo para enviártelo lo más pronto posible.</p>

            <div>
                <h3>Resumen de pedido</h3>
                <p>
                    <span>Total:</span> ${transactionAmount.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
    })}
                </p>

                <div>
                    <h3>Detalles del Pago</h3>
                    <p>
                        ${paymentMethod.id} **** ${card.lastFour}
                    </p>
                </div>

                <p><span>Email Mercado Pago:</span> ${payer.email}</p>

                <div>
                    <h3>Detalles de los Items</h3>
                    <ul>
                        ${orderItems.join("")}
                    </ul>
                </div>

                <div>
                    <p><strong>ID del Pago:</strong> ${paymentId}</p>
                </div>
            </div>

            <footer>
                <p>&copy; ${new Date().getFullYear()} Colombiatodo CI SAS. Todos los derechos reservados.</p>
            </footer>
        </div>
    `

}