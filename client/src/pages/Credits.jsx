import { Container, Table } from 'react-bootstrap';
import usePageTitle from '../hooks/usePageTitle';
import PageHeader from '../components/PageHeader';
import credits from '../data/photoCredits.json';

// Attribution for the openly licensed photos used across the site (required by CC BY / BY-SA)
export default function Credits() {
  usePageTitle('Photo credits');
  return (
    <Container>
      <PageHeader title="Photo credits" subtitle="Photos are from Wikimedia Commons under the licences below. Cropped and resized for this site." />
      <Table responsive className="ops-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Title</th>
            <th>Author</th>
            <th>Licence</th>
          </tr>
        </thead>
        <tbody>
          {credits.map((c) => (
            <tr key={c.image}>
              <td><div className="ops-thumb" style={{ display: 'block' }}><img src={c.image} alt="" loading="lazy" /></div></td>
              <td><a href={c.source} target="_blank" rel="noreferrer">{c.title}</a></td>
              <td>{c.author}</td>
              <td>{c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noreferrer">{c.license}</a> : c.license}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
