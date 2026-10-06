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
    // VAPID Public Key
    if (url.pathname === "/vapid-public-key") {
      return new Response(env.VAPID_PUBLIC_KEY, {
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // Сохраняем подписку iPhone
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
        return new Response("Ошибка сохранения подписки", {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }
    // Сохраняем лекарства и время
    if (url.pathname === "/medicines" && request.method === "POST") {
      try {
        const data = await request.json();
        await env.REMINDERS.put(
          "medicines",
          JSON.stringify(data)
        );
        return new Response("Напоминания сохранены", {
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response("Ошибка сохранения напоминаний", {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }
    // Тестовая отправка
    if (url.pathname === "/test-push") {
      const subscriptionData =
        await env.REMINDERS.get("subscription");
      if (!subscriptionData) {
        return new Response(
          "Подписка не найдена в KV",
          { status: 404 }
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
        "Уведомление отправлено!"
      );
    }
    return new Response(
      "Напоминалка работает 💊"
    );
  },
  // Автоматическая проверка каждую минуту
  async scheduled(controller, env, ctx) {
    try {
      const subscriptionData =
        await env.REMINDERS.get("subscription");
      const medicinesData =
        await env.REMINDERS.get("medicines");
      if (!subscriptionData || !medicinesData) {
        return;
      }
      const subscription =
        JSON.parse(subscriptionData);
      const data =
        JSON.parse(medicinesData);
      const medicines =
        data.medicines || [];
      const timezone =
        data.timezone || "UTC";
      const now =
        new Date();
      // Текущее местное время пользователя
      const localTime =
        new Intl.DateTimeFormat("ru-RU", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }).format(now);
      // Сегодняшняя дата пользователя
      const localDate =
        new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(now);
      // Последние отправленные напоминания
      const lastSentData =
        await env.REMINDERS.get("lastSent");
      const lastSent =
        lastSentData
          ? JSON.parse(lastSentData)
          : {};
      webpush.setVapidDetails(
        "mailto:test@example.com",
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
      );
      for (const medicine of medicines) {
        if (medicine.time !== localTime) {
          continue;
        }
        const key =
          medicine.name + "|" + medicine.time;
        const sendKey =
          localDate + "|" + key;
        // Не отправляем повторно сегодня
        if (lastSent[key] === sendKey) {
          continue;
        }
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: "💊 Напоминание",
            body:
              "Пора проверить напоминалку: " +
              medicine.name
          })
        );
        lastSent[key] =
          sendKey;
      }
      await env.REMINDERS.put(
        "lastSent",
        JSON.stringify(lastSent)
      );
    } catch (error) {
      console.error(
        "Ошибка автоматического напоминания:",
        error
      );
    }
  }
};
