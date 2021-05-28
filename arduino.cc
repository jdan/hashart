/**
 * A script to draw hashart images on an Inkplate (https://inkplate.io/)
 */

#include "Inkplate.h"
#include <HTTPClient.h>
#include <WiFi.h>

Inkplate display(INKPLATE_1BIT);

void setup()
{
    display.begin();
    display.clearDisplay();
    display.clean();

    display.setCursor(50, 290);
    display.setTextSize(3);
    display.print(F("Loading art"));
    display.display();

    WiFi.begin("[your ssid here]", "[your password here]");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(100);
        display.print(".");
        display.partialUpdate();
    }

    display.println("Connected!");
    display.partialUpdate();
}

void loop()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        WiFi.reconnect();
        delay(5000);
    }

    display.clearDisplay();

    // https://github.com/jdan/hashart#a-small-screenshot-service
    char *url = "https://FILLMEIN/random/800/600/random.png";

    display.drawImage(url, 0, 0, true, 0);
    display.display();

    // Sleep for 60 seconds
    esp_sleep_enable_timer_wakeup(1000L * 60000L);
    (void)esp_light_sleep_start();
}
