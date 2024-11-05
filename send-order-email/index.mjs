import AWS from 'aws-sdk';

const ses = new AWS.SES();

export const handler = async (event) => {
  const { orderId, email, total, products } = JSON.parse(event.Records[0].body);

  const productListHtml = products.map(product => `
    <li>${product.blendName} - ${product.quantity} x $${product.price.toFixed(2)} (${product.grams}g, ${product.grind})</li>
  `).join('');

  const emailParams = {
    Source: 'your-email@example.com', // Cambia esto por tu dirección de correo verificada en SES
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: `Order Confirmation - #${orderId}`
      },
      Body: {
        Html: {
          Data: `
            <h1>Thank you for your order!</h1>
            <p>Your order number is <strong>${orderId}</strong></p>
            <p>Order Details:</p>
            <ul>${productListHtml}</ul>
            <p>Total: $${total.toFixed(2)}</p>
            <p>We appreciate your business and hope you enjoy your purchase!</p>
          `
        }
      }
    }
  };

  try {
    await ses.sendEmail(emailParams).promise();
    console.log(`Order confirmation email sent to ${email}`);
    return { statusCode: 200, body: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { statusCode: 500, body: 'Failed to send email' };
  }
};