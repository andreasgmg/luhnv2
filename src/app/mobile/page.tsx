import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Mobilnummer (Test) | Luhn.se',
  description: 'Generera säkra svenska mobilnummer för teständamål. Använder PTS reserverade serie 070-174xxxx.',
};

export default function Page() {
  return <Generator type="mobile" />;
}
