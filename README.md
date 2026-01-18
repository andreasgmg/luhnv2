# Luhn.se - Svensk Testdata & Validering

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Next.js](https://img.shields.io/badge/built%20with-Next.js-black)

Sveriges mest kompletta verktyg för att generera och validera testdata. Byggt för utvecklare, med fokus på **CI/CD**, **Säkerhet** och **Enkelhet**.

🌐 **Live Demo:** [https://luhn.se](https://luhn.se)

## 🚀 Features

*   ✅ **Personnummer:** Generera giltiga, syntetiska personnummer med Luhn-kontroll och realistiska namn/adresser.
*   ✅ **Samordningsnummer:** Stöd för individer utan personnummer (Dag + 60).
*   ✅ **Organisationsnummer:** Skapa bolagsprofiler med korrekta org.nummer och VAT.
*   ✅ **Bankgiro & Plusgiro:** Generera säkra nummer (998-serien) för betalningstester.
*   ✅ **Bankkonton:** Validera clearingnummer och kontonummer mot Bankföreningens regelverk (Swedbank, SEB, Nordea, etc.).
*   ✅ **OCR:** Generera referensnummer med längd- och checksummekontroll.
*   ✅ **API:** Öppet REST-API med CORS-stöd för integration i testmiljöer.

## 🛠 API Quick Start

Inga API-nycklar. Ingen autentisering. Bara anropa.

### Generera Personnummer
```bash
curl "https://luhn.se/api/generate?type=personnummer"
```

**Response:**
```json
{
  "ssn": "19900505-1234",
  "firstName": "Lars",
  "lastName": "Svensson",
  "gender": "male",
  "type": "person",
  "address": {
    "street": "Storgatan 12",
    "zip": "111 22",
    "city": "Stockholm"
  }
}
```

### Validera Bankkonto
```bash
curl "https://luhn.se/api/validate?type=account&value=8105&value2=993422324"
```

**Response:**
```json
{
  "valid": true,
  "bankName": "Swedbank"
}
```

## 📦 Kör lokalt (Docker)

Du kan köra hela Luhn.se som en container i din egen infrastruktur.

```bash
docker build -t luhn .
docker run -p 3000:3000 luhn
```

Öppna `http://localhost:3000` i din webbläsare.

## 💻 Utveckling

Vill du bidra? Grymt!

```bash
# Klona repot
git clone https://github.com/ditt-namn/luhnv2.git

# Installera beroenden
npm install

# Starta dev-servern
npm run dev
```

## 🛡️ GDPR & Säkerhet

All data som genereras är **100% syntetisk**.
*   Namn och adresser slumpas fram från SCB:s topplistor och postnummerregister.
*   Personnummer är matematiskt giltiga men tillhör inte nödvändigtvis en levande person.
*   Bankgironummer hämtas från test-serier (998-xxxx).

Tjänsten är **stateless** och sparar ingen data om anropen.

## 📄 Licens

MIT © [Luhn.se](https://luhn.se)