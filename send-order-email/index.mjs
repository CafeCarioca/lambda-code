import nodemailer from 'nodemailer';

// Configuración del transporte SMTP
const transporter = nodemailer.createTransport({
    host: "email-smtp.us-east-1.amazonaws.com", // Cambia la región si es necesario
    port: 587,
    secure: false, // true para el puerto 465, false para otros puertos
    auth: {
        user: process.env.SES_SMTP_USER, // Configura esto en tus variables de entorno
        pass: process.env.SES_SMTP_PASSWORD, // Configura esto en tus variables de entorno
    },
});

export const handler = async (event) => {
    const { orderId, email, total, products } = JSON.parse(event.Records[0].body);

    const productListHtml = products.map(product => `
        <li>${product.blendName} - ${product.quantity} x $${product.price.toFixed(2)} (${product.grams}g, ${product.grind})</li>
    `).join('');

    const mailOptions = {
        from: 'enzo@elcarioca.com.uy', // Cambia esto por tu dirección de correo verificada en SES
        to: email,
        subject: `Order Confirmation - #${orderId}`,
        html: `
            <h1>Thank you for your order!</h1>
            <p>Your order number is <strong>${orderId}</strong></p>
            <p>Order Details:</p>
            <ul>${productListHtml}</ul>
            <p>Total: $${total.toFixed(2)}</p>
            <p>We appreciate your business and hope you enjoy your purchase!</p>
        `,
    };

    try {
        // Enviar el correo electrónico
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${email}`);
        return { statusCode: 200, body: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { statusCode: 500, body: 'Failed to send email' };
    }
};