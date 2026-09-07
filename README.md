# NetzWache

NetzWache ist ein Webseiten-Monitor fuer den Lesezeichen-Hub. Der Hub prüft Ziele im Hintergrund, misst ihre Antwortzeit und speichert die Messungen lokal.

Repository: https://github.com/Lesezeichen-Hub/NetzWache

## Verwendung

NetzWache im Lesezeichen-Hub öffnen, Ziel anlegen und bei Bedarf **Jetzt prüfen** wählen. Der Hub führt konfigurierte Intervalle im Hintergrund aus, auch wenn die Modulseite geschlossen ist.

NetzWache verwendet die allgemeine Hub-API für HTTP-Monitore. Diese API kann auch von anderen Hub-Modulen verwendet werden; Ziele bleiben über die jeweilige Modul-ID getrennt. Externe Webseiten funktionieren ohne CORS-Freigabe. Aus Sicherheitsgründen prüft der Hub nur öffentliche HTTP(S)-Adressen; lokale, private und Link-Local-Netzadressen sind ausgeschlossen.

## Funktionen

- Mehrere HTTP(S)-Ziele mit eigenen Prüfintervallen
- Manuelle Prüfung mit 20 Sekunden Zeitlimit
- Hub-gestützter Verlauf mit den jeweils neuesten 200 Messungen je Ziel
- Status, Antwortzeit und Verfügbarkeit der letzten 30 Prüfungen
- Canvas-Diagramm mit erfolgreichen Messungen und Fehler-Markierungen