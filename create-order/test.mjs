import { handler } from './index.mjs'; // Asegúrate de tener el camino correcto al archivo

const event = {
  body: JSON.stringify({
    order: {
      userDetails: {
        email: "edeleo@enjknewfrdwq",
        firstName: "enzo",
        lastName: "de leon",
        country: "Uruguay",
        documentType: "ci",
        documentNumber: "5461565",
        phone: "094707824",
        termsAccepted: true,
        facturaConRUT: false,
        razonSocial: "",
        rut: "",
        recipient: "rweqrwq",
        address: {
          street: "Tiburcio Gomez",
          doorNumber: "1548",
          apartment: "2",
          department: "Montevideo",
          postalCode: "11600",
          location: {
            lat: -34.9215791,
            lng: -56.1507014
          }
        },
        remarks: "Ninguna"
      },
      products: [
        {
          blendName: "Extra Fuerte",
          singleImg: "/static/media/1single.b64a7987.png",
          quantity: 1,
          price: 39,
          grams: 250,
          grind: "Whole Beans",
          isCapsule: false,
          id: 971.6243059331977
        },
        {
          blendName: "Selecto",
          singleImg: "/static/media/3single.3e838e97.jpg",
          quantity: 1,
          price: 39,
          grams: 500,
          grind: "Chemex",
          isCapsule: false,
          id: 892.4803372918564
        },
        {
          blendName: "Supremo",
          singleImg: "/static/media/4single.9853a274.jpg",
          quantity: 1,
          price: 39,
          grams: 1000,
          grind: "V60",
          isCapsule: false,
          id: 410.87185724298905
        }
      ]
    }
  })
};

handler(event).then(response => {
  console.log('Response:', response);
}).catch(error => {
  console.error('Error:', error);
});