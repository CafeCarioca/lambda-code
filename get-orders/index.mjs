// Lambda function to get orders from the database
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
    host: 'mydb.c5q62sc8kur1.us-east-1.rds.amazonaws.com',
    user: 'dbuser',
    password: 'dbpassword',
    database: 'cariocaecommerce'
};

// Lambda handler function
export const handler = async (event) => {
    let connection;
    try {
        // Create a connection to the database
        connection = await mysql.createConnection(dbConfig);

        // Query to get orders and their items for a specific user (if user_id is provided)
        const userId = event.queryStringParameters?.userId;
        let query = `
            SELECT o.id AS order_id, o.order_date, o.status, o.total,
                   a.street, a.door_number, a.apartment, a.department, a.city, a.state, a.country,
                   oi.product_id, oi.quantity, oi.price, oi.grams, oi.grind,
                   p.name AS product_name
            FROM orders o
            JOIN addresses a ON o.address_id = a.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id`;

        const queryParams = [];
        if (userId) {
            query += ' WHERE o.user_id = ?';
            queryParams.push(userId);
        }

        // Execute the query
        const [rows] = await connection.execute(query, queryParams);

        // Group the results by order_id to create a structured response
        const orders = {};
        rows.forEach(row => {
            if (!orders[row.order_id]) {
                orders[row.order_id] = {
                    orderId: row.order_id,
                    orderDate: row.order_date,
                    status: row.status,
                    total: row.total,
                    address: {
                        street: row.street,
                        doorNumber: row.door_number,
                        apartment: row.apartment,
                        department: row.department,
                        city: row.city,
                        state: row.state,
                        country: row.country
                    },
                    items: []
                };
            }
            orders[row.order_id].items.push({
                productId: row.product_id,
                productName: row.product_name,
                quantity: row.quantity,
                price: row.price,
                grams: row.grams,
                grind: row.grind
            });
        });

        // Convert orders object to an array
        const responseOrders = Object.values(orders);

        // Return successful response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(responseOrders)
        };
    } catch (error) {
        // Handle any errors
        console.error('Error fetching orders:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: 'Error fetching orders', error: error.message })
        };
    } finally {
        if (connection) {
            try {
                // Close the database connection
                await connection.end();
            } catch (closeError) {
                console.error('Error closing the database connection:', closeError);
            }
        }
    }
};
