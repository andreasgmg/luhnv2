import Generator from '../../../components/Generator';

export async function generateMetadata({ params }) {
  const type = params.type;
  
  let title = 'Validera Nummer | Luhn.se';
  let desc = 'Gratis verktyg för att validera svenska identitets- och finansiella nummer.';

  switch(type) {
    case 'personnummer':
      title = 'Validera Personnummer & Samordningsnummer | Luhn.se';
      desc = 'Kontrollera om ett svenskt personnummer eller samordningsnummer är giltigt. Validerar Luhn-algoritm och datum.';
      break;
    case 'organisation':
      title = 'Validera Organisationsnummer | Luhn.se';
      desc = 'Gratis validering av svenska organisationsnummer för aktiebolag, handelsbolag och föreningar.';
      break;
    case 'moms':
      title = 'Validera Svenskt Momsnummer (VAT) | Luhn.se';
      desc = 'Kontrollera format och giltighet för svenska SE-momsnummer (VAT-nummer).';
      break;
    case 'bankgiro':
      title = 'Validera Bankgironummer | Luhn.se';
      desc = 'Validera svenska bankgironummer snabbt och enkelt. Kontrollerar checksiffra och format.';
      break;
    case 'bankkonto':
      title = 'Validera Bankkonto & Clearingnummer | Luhn.se';
      desc = 'Kontrollera svenska bankkontonummer och clearingnummer. Identifierar vilken bank numret tillhör (t.ex. Swedbank, SEB).';
      break;
  }

  return {
    title: title,
    description: desc,
    alternates: {
      canonical: `https://luhn.se/validator/${type}`,
    },
  };
}

export default function Page() {
  return <Generator />;
}