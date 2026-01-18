import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Svenska Bankkonton | Luhn.se',
  description: 'Skapa giltiga svenska bankkonton med korrekt clearingnummer för SEB, Swedbank, Nordea, Handelsbanken och fler.',
  alternates: {
    canonical: 'https://luhn.se/bank-account',
  },
};

export default function Page() {
  return <Generator />;
}