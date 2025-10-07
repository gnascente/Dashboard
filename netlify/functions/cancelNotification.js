// netlify/functions/cancelNotification.js

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { notificationId } = JSON.parse(event.body);
    const ONE_SIGNAL_APP_ID = "bfad3d68-ae1c-4b4c-90a7-dc211aa11727";
    const ONE_SIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

    if (!ONE_SIGNAL_API_KEY) {
      throw new Error("A chave de API do OneSignal não está configurada no servidor.");
    }

    if (!notificationId) {
        return { statusCode: 400, body: 'Notification ID é obrigatório.' };
    }

    const response = await fetch(`https://onesignal.com/api/v1/notifications/${notificationId}?app_id=${ONE_SIGNAL_APP_ID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${ONE_SIGNAL_API_KEY}`
      }
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
