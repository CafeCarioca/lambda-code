import mysql from 'mysql2/promise';

export const handler = async (event) => {
  const connection = await mysql.createConnection({
    host: 'mydb.c5q62sc8kur1.us-east-1.rds.amazonaws.com',
    user: 'dbuser',
    password: 'dbpassword',
    database: 'cariocaecommerce'
  });

  const { order } = JSON.parse(event.body);
  const { userDetails, products } = order;

  try {
    // Log the incoming data to check for undefined values
    console.log('User Details:', userDetails);
    console.log('Address:', userDetails.address);
    console.log('Products:', products);

    // Check if the user exists
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [userDetails.email]
    );

    let userId = users.length ? users[0].id : null;

    if (!userId) {
      // User doesn't exist, insert new user
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, first_name, last_name, document_type, document_number, phone, terms_accepted, factura_con_rut, razon_social, rut, recipient, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userDetails.email.split('@')[0], // Example username
          userDetails.email,
          userDetails.firstName,
          userDetails.lastName,
          userDetails.documentType,
          userDetails.documentNumber,
          userDetails.phone,
          userDetails.termsAccepted,
          userDetails.facturaConRUT,
          userDetails.razonSocial,
          userDetails.rut,
          userDetails.recipient,
          userDetails.remarks
        ]
      );
      userId = result.insertId;
    }

    // Handle address
    const { street, doorNumber, apartment, department, postalCode, location } = userDetails.address;
    // Assign 'city' with a default value from 'department' if it's undefined
    const city = userDetails.address.city || department;

    // Additional logs for address fields
    console.log('Address Details:', { street, doorNumber, apartment, department, city, postalCode, location });

    const [existingAddresses] = await connection.execute(
      'SELECT id FROM addresses WHERE user_id = ? AND street = ? AND door_number = ? AND apartment = ? AND department = ? AND city = ? AND state = ? AND postal_code = ? AND country = ?',
      [userId, street, doorNumber, apartment, department, city, department, postalCode, userDetails.country]
    );

    let addressId = existingAddresses.length ? existingAddresses[0].id : null;

    if (!addressId) {
      // Address doesn't exist, insert new address
      const [result] = await connection.execute(
        'INSERT INTO addresses (user_id, street, door_number, apartment, department, city, state, postal_code, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          street,
          doorNumber,
          apartment,
          department,
          city,
          department, // Assuming 'state' refers to 'department' in your schema
          postalCode,
          userDetails.country,
          location.lat,
          location.lng
        ]
      );
      addressId = result.insertId;
    }

    // Create order
    const total = products.reduce((sum, product) => sum + product.price * product.quantity, 0);

    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, address_id, status, total) VALUES (?, ?, ?, ?)',
      [userId, addressId, 'Pending', total]
    );

    const orderId = orderResult.insertId;



     // Insert order items
    for (const product of products) {
      // Verificar si el producto existe
      const [existingProduct] = await connection.execute(
        'SELECT id FROM products WHERE name = ?',
        [product.blendName]
      );

      if (existingProduct.length === 0) {
        throw new Error(`Product ${product.blendName} does not exist in the database.`);
      }

      const productId = existingProduct[0].id;

      // Insertar el elemento de la orden
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price, grams, grind) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, productId, product.quantity, product.price, product.grams, product.grind]
      );
    }

    await connection.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order created successfully', orderId })
    };
  } catch (error) {
    console.error('Error creating order:', error);
    await connection.end();

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create order', error: error.message })
    };
  }
};