import Generator from '../../components/Generator';

export const metadata = {
  title: 'Generera Plusgiro | Luhn.se',
  description: 'Skapa giltiga plusgironummer för betalningstester.',
};

export default function Page() {
  return <Generator type="plusgiro" />;
}
