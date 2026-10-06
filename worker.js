import webpush from "web-push";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Получить VAPID Public Key
    if (url.pathname === "/vapid-public-key") {
      return new Response(env.VAPID_PUBLIC_KEY, {
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Сохранить push-подписку
    if (url.pathname === "/subscribe" && request.method === "POST") {
      const subscription = await request.json();

      await env.REMINDERS.put(
        "subscription",
        JSON.stringify(subscription)
      );

      return new Response("Подписка сохранена", {
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response("Напоминалка работает 💊");
  }
};
