export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/vapid-public-key") {
      return new Response(env.VAPID_PUBLIC_KEY, {
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response("Напоминалка работает 💊");
  }
};
