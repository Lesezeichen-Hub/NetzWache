# NetzWache

NetzWache ist ein Webseiten-Monitor fuer den Lesezeichen-Hub. Der Hub prueft Ziele im Hintergrund, misst ihre Antwortzeit und speichert die Messungen lokal.

Repository: https://github.com/Lesezeichen-Hub/NetzWache

## Verwendung

NetzWache im Lesezeichen-Hub oeffnen, Ziel anlegen und bei Bedarf **Jetzt pruefen** waehlen. Der Hub fuehrt konfigurierte Intervalle im Hintergrund aus, auch wenn die Modulseite geschlossen ist.

NetzWache verwendet die Hub-API fuer HTTP-Monitore. Die Monitor-Pruefungen laufen im Hub ueber die gemeinsame `/api/http/inspect`-Funktionalitaet. Persistente Monitor-Ziele bleiben ueber die jeweilige Modul-ID getrennt; spontane HTTP-Pruefungen koennen andere Module direkt ueber `/api/http/inspect` ausfuehren. Externe Webseiten funktionieren ohne CORS-Freigabe. Aus Sicherheitsgruenden prueft der Hub nur oeffentliche HTTP(S)-Adressen; lokale, private und Link-Local-Netzadressen sind ausgeschlossen.

## Funktionen

- Mehrere HTTP(S)-Ziele mit eigenen Pruefintervallen
- Manuelle Pruefung mit 20 Sekunden Zeitlimit
- Hub-gestuetzter Verlauf mit den jeweils neuesten 200 Messungen je Ziel
- Status, Antwortzeit und Verfuegbarkeit der letzten 30 Pruefungen
- Canvas-Diagramm mit erfolgreichen Messungen und Fehler-Markierungen