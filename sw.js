self.addEventListener("push", function(event) {

    let data = {};

    try {
        data = event.data.json();
    } catch (e) {
        data = {
            title: "💊 Напоминание",
            body: "Пора проверить напоминалку"
        };
    }

    event.waitUntil(
        self.registration.showNotification(
            data.title || "💊 Напоминание",
            {
                body: data.body || "Пора принять лекарство",
                icon: "icon.png",
                badge: "icon.png"
            }
        )
    );
});


self.addEventListener("notificationclick", function(event) {

    event.notification.close();

    event.waitUntil(
        clients.openWindow("/")
    );

});
