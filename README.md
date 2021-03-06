# BlockArt React-Native App

Dieses Projekt beinhaltet eine React-Native App, die mithilfe einer Blockchain Kunstwerke handeln kann.
Für die Installation der Entwicklungsumgebung siehe https://codeburst.io/setting-up-development-environment-using-react-native-on-windows-dd240e69f776



Nach dem Klonen des Projektes muss der Befehl `npm install` ausgeführt werden, um alle notwendigen Dependencies zu installieren. Dabei wird installiert:
- Okta (Authentifizierung)
- Axios (Vereinfachte API-Aufrufe)
- NFC-Manager
- In-App-Browser
- Carousel (Für die Anzeige der Kunstwerke)

Um die App auf einem Android Emulator oder angeschlossenem Android Gerät zu starten, wird der Befehl `react-native run-android` verwendet.


Für die Benutzer-Authentifizierung wird der OAuth-Dienst Okta verwendet (https://www.okta.com/). Dort kann man eine neue Applikation erstellen, um Benutzer ein-und auszuloggen und zu verwalten.
Innerhalb der App wird die Okta-API zur Authentifizierung verwendet (siehe LoginScreen.js).


Die App stellt das Frontend für die Blockchain-Funktionalitäten dar. Sie tätigt lediglich API-Aufrufe zum Backend https://github.com/julianhofer/BlockArt-backend




Die App befindet sich im blockartapp-Ordner. Der frontend-Ordner beinhaltet die Vorgängerversion, ist aber nur noch aus Backup-Gründen vorhanden und hinfällig.
