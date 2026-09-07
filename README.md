# NetzWache

NetzWache ist ein lokaler Webseiten-Monitor. Die Anwendung prüft erreichbare HTTP(S)-Ziele, misst deren Antwortzeit und zeigt die letzten Messungen grafisch an.

Repository: https://github.com/Lesezeichen-Hub/NetzWache

## Verwendung

`index.html` im Browser öffnen, Ziel anlegen und **Jetzt prüfen** wählen. Prüfungen und Historie bleiben in `localStorage` des verwendeten Browsers.

Für fremde Webseiten ist eine erfolgreiche Browser-Prüfung nur möglich, wenn der Server CORS-Anfragen erlaubt. Eigene APIs oder Gesundheitsendpunkte können den Header `Access-Control-Allow-Origin` passend setzen. NetzWache kennzeichnet fehlende CORS-Freigaben als `CORS / Netzwerkfehler`.

## Funktionen

- Mehrere HTTP(S)-Ziele mit eigenen Prüfintervallen
- Manuelle Prüfung mit 20 Sekunden Zeitlimit
- Lokaler Verlauf mit bis zu 200 Messungen je Ziel
- Status, Antwortzeit und Verfügbarkeit der letzten 30 Prüfungen
- Canvas-Diagramm mit erfolgreichen Messungen und Fehler-Markierungen