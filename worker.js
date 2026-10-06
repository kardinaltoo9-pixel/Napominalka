import webpush from "web-push";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Разрешаем запросы от сайта
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // VAPID Public Key
    if (url.pathname === "/vapid-public-key") {
      return new Response(env.VAPID_PUBLIC_KEY, {
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Сохранение push-подписки iPhone
    if (
      url.pathname === "/subscribe" &&
      request.method === "POST"
    ) {
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
        return new Response(
          "Ошибка сохранения подписки",
          {
            status: 500,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    // Сохранение лекарств и времени
    if (
      url.pathname === "/medicines" &&
      request.method === "POST"
    ) {
      try {
        const data = await request.json();

        await env.REMINDERS.put(
          "medicines",
          JSON.stringify(data)
        );

        return new Response(
          "Напоминания сохранены",
          {
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      } catch (error) {
        return new Response(
          "Ошибка сохранения напоминаний",
          {
            status: 500,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    return new Response(
      "Напоминалка работает 💊"
    );
  }
};
