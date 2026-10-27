import { Container } from 'react-bootstrap';
import PageHeader from './PageHeader';

// Temporary placeholder for pages delivered in a later phase
export default function ComingSoon({ title }) {
  return (
    <Container className="py-4">
      <PageHeader title={title} subtitle="This section is being built." />
    </Container>
  );
}
