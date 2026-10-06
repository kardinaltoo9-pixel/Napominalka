import webpush from "web-push";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // Главная страница Worker
    if (url.pathname === "/") {
      return new Response("Напоминалка работает 💊");
    }

    // VAPID Public Key
    if (url.pathname === "/vapid-public-key") {
      return new Response(env.VAPID_PUBLIC_KEY, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/plain"
        }
      });
    }

    // Получение и сохранение подписки
    if (
      url.pathname === "/subscribe" &&
      request.method === "POST"
    ) {
      try {
        const subscription = await request.json();

        if (
          !subscription ||
          !subscription.endpoint
        ) {
          return new Response(
            "Подписка пришла без endpoint",
            {
              status: 400,
              headers: {
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }

        await env.REMINDERS.put(
          "subscription",
          JSON.stringify(subscription)
        );

        return new Response(
          "Подписка сохранена",
          {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      } catch (error) {
        return new Response(
          "Ошибка /subscribe: " + error.message,
          {
            status: 500,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    // Сохранение лекарств
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
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      } catch (error) {
        return new Response(
          "Ошибка /medicines: " + error.message,
          {
            status: 500,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    // Проверка подписки
    if (url.pathname === "/check-subscription") {
      const subscription =
        await env.REMINDERS.get("subscription");

      if (!subscription) {
        return new Response(
          "Подписки в KV нет",
          {
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      return new Response(
        "Подписка в KV ЕСТЬ",
        {
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // Тестовое push-уведомление
    if (url.pathname === "/test-push") {
      try {
        const subscriptionData =
          await env.REMINDERS.get("subscription");

        if (!subscriptionData) {
          return new Response(
            "Подписка не найдена в KV",
            {
              status: 404,
              headers: {
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
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

        return new Response(
          "Уведомление отправлено!",
          {
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      } catch (error) {
        return new Response(
          "Ошибка push: " + error.message,
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
      "Адрес не найден",
      { status: 404 }
    );
  },

  async scheduled(controller, env, ctx) {
    // Пока оставляем пустым.
    // Сначала проверим подписку.
  }
};
