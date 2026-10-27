import { Container, Nav, Tab } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { BoxSeam, ClipboardCheck } from 'react-bootstrap-icons';
import PageHeader from '../../components/PageHeader';
import EquipmentManager from '../../components/admin/EquipmentManager';
import RentalsManager from '../../components/admin/RentalsManager';
import usePageTitle from '../../hooks/usePageTitle';

// Consolidated operations page: one place to view, update and delete records
export default function Operations() {
  usePageTitle('Operations');
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'equipment';

  return (
    <Container className="py-4">
      <PageHeader title="Operations" subtitle="View, add, update and delete equipment and manage rental requests." />
      <Tab.Container activeKey={tab} onSelect={(key) => setParams({ tab: key }, { replace: true })}>
        <Nav variant="pills" className="mb-3 gap-2">
          <Nav.Item>
            <Nav.Link eventKey="equipment" className="d-flex align-items-center gap-2"><BoxSeam />Equipment</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="rentals" className="d-flex align-items-center gap-2"><ClipboardCheck />Rentals</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="equipment" mountOnEnter>
            <EquipmentManager />
          </Tab.Pane>
          <Tab.Pane eventKey="rentals" mountOnEnter>
            <RentalsManager />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
}
