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
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    if (url.pathname === "/subscribe" && request.method === "POST") {
      try {
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

      } catch (error) {
        return new Response("Ошибка сохранения", {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    return new Response("Напоминалка работает 💊");
  }
};
