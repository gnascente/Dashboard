export default async function handler(req, res) {
  // Garante que o método da requisição é POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { ONE_SIGNAL_APP_ID, ONE_SIGNAL_REST_API_KEY } = process.env;

  if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
    console.error("Variáveis de ambiente do OneSignal não configuradas.");
    return res.status(500).json({ success: false, error: "Configuração do servidor incompleta." });
  }

  const notificationPayload = {
    ...req.body,
    app_id: ONE_SIGNAL_APP_ID,
  };

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONE_SIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao enviar notificação para o OneSignal:', data);
      return res.status(response.status).json({ success: false, error: data });
    }

    // Retorna a resposta de sucesso do OneSignal para o frontend
    res.status(200).json(data);

  } catch (error) {
    console.error('Erro interno na função scheduleNotification:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
}
