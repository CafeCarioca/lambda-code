import axios from 'axios';

export const handler = async (event) => {
    console.log('Event:', event);

    try {
        const body = event.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : event;
        console.log('Parsed body:', body);

        const items = body.items.map(item => ({
            title: item.title,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            currency_id: 'UYU'
        }));

        console.log('Items:', items);

        const preferenceBody = {
            items: items,
            back_urls: {
                success: 'https://www.youtube.com/watch?v=-VD-l5BQsuE',
                failure: 'https://www.youtube.com/watch?v=-VD-l5BQsuE',
                pending: 'https://www.youtube.com/watch?v=-VD-l5BQsuE'
            },
            auto_return: 'approved'
        };

        console.log('PreferenceBody:', preferenceBody);

        const response = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceBody, {
            headers: {
                'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ id: response.data.id })
        };
    } catch (error) {
        console.error('Error creating preference:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: error instanceof Error ? error.message : JSON.stringify(error) })
        };
    }
};
