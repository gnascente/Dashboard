export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { ONE_SIGNAL_APP_ID, ONE_SIGNAL_REST_API_KEY } = process.env;
  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({ success: false, error: "ID da notificação é obrigatório." });
  }

  if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
    console.error("Variáveis de ambiente do OneSignal não configuradas.");
    return res.status(500).json({ success: false, error: "Configuração do servidor incompleta." });
  }

  const url = `https://onesignal.com/api/v1/notifications/${notificationId}?app_id=${ONE_SIGNAL_APP_ID}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${ONE_SIGNAL_REST_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao cancelar notificação no OneSignal:', data);
      return res.status(response.status).json({ success: false, error: data });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('Erro interno na função cancelNotification:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
}
