# Quiz - Naturen jobber

Åpne `embed-demo.html` med Live Server og velg **Start quiz**. Quizen åpner over hele den synlige nettsiden. **Tilbake** lukker quizen, og du kan åpne den igjen og fortsette der du var.

Når quizen er publisert, kan vertssiden legge dette der quizen skal vises.

```html
<script src="https://eksempel.no/naturen-jobber/embed-overlay.js"></script>
```

Bytt ut eksempeladressen med adressen til den publiserte `embed-overlay.js`. Skriptet legger til en knapp og åpner `index.html` fra samme mappe i en iframe inne i en dialog på vertssiden.

For visning direkte i en seksjon bruker du `embed.js`. Da måler `frame-resize.js` quizen og sender høyden til vertssiden. Hvis vertssiden bare tillater iframe-kode, kan den bruke `index.html` som `src` og angi høyden i innbyggingen.

