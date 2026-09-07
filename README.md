# NetzWache

NetzWache ist ein lokaler Webseiten-Monitor. Die Anwendung prüft erreichbare HTTP(S)-Ziele, misst deren Antwortzeit und zeigt die letzten Messungen grafisch an.

Repository: https://github.com/Lesezeichen-Hub/NetzWache

## Verwendung

`index.html` im Browser öffnen, Ziel anlegen und **Jetzt prüfen** wählen. Prüfungen und Historie bleiben in `localStorage` des verwendeten Browsers.

Als Hub-Modul ruft NetzWache den serverseitigen Prüfendpunkt `/api/netzwache/check` des Lesezeichen-Hubs auf. Damit funktionieren externe Webseiten auch ohne CORS-Freigabe. Aus Sicherheitsgründen prüft der Hub nur öffentliche HTTP(S)-Adressen; lokale, private und Link-Local-Netzadressen sind ausgeschlossen.

## Funktionen

- Mehrere HTTP(S)-Ziele mit eigenen Prüfintervallen
- Manuelle Prüfung mit 20 Sekunden Zeitlimit
- Lokaler Verlauf mit bis zu 200 Messungen je Ziel
- Status, Antwortzeit und Verfügbarkeit der letzten 30 Prüfungen
- Canvas-Diagramm mit erfolgreichen Messungen und Fehler-Markierungen