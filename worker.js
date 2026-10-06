import webpush from "web-push";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (url.pathname === "/vapid-public-key") {
      return new Response(env.VAPID_PUBLIC_KEY, {
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

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

    // ТЕСТОВОЕ УВЕДОМЛЕНИЕ
    if (url.pathname === "/test-push") {
      const subscriptionData =
        await env.REMINDERS.get("subscription");

      if (!subscriptionData) {
        return new Response("Подписка не найдена в KV", {
          status: 404
        });
      }

      const subscription =
        JSON.parse(subscriptionData);

      webpush.setVapidDetails(
        "mailto:test@example.com",
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
      );

      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "💊 Тест",
          body: "Серверное уведомление работает!"
        })
      );

      return new Response("Уведомление отправлено!");
    }

    return new Response("Напоминалка работает 💊");
  },

  async scheduled(controller, env, ctx) {
    // Пока ничего не делаем.
  }
};
