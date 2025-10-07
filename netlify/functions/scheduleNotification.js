// netlify/functions/scheduleNotification.js

exports.handler = async function(event, context) {
  // Apenas permite requisições do tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const notificationPayload = JSON.parse(event.body);
    const ONE_SIGNAL_APP_ID = "bfad3d68-ae1c-4b4c-90a7-dc211aa11727";

    // Pega a chave secreta das variáveis de ambiente do Netlify
    const ONE_SIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

    if (!ONE_SIGNAL_API_KEY) {
      throw new Error("A chave de API do OneSignal não está configurada no servidor.");
    }
    
    // Adiciona o App ID ao payload recebido do frontend
    const finalPayload = {
        ...notificationPayload,
        app_id: ONE_SIGNAL_APP_ID
    };

    const response = await fetch('[https://onesignal.com/api/v1/notifications](https://onesignal.com/api/v1/notifications)', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${ONE_SIGNAL_API_KEY}`
      },
      body: JSON.stringify(finalPayload)
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
