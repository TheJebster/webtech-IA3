import { Link } from 'react-router-dom';
import { Plus } from 'react-bootstrap-icons';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import useAddToRequest from '../../hooks/useAddToRequest';
import { formatCurrency } from '../../utils/format';
import EquipmentImage from '../EquipmentImage';
import Availability from './Availability';

// Product card: photo, category, name, daily rate, availability for the chosen dates, quick add
export default function ProductCard({ item }) {
  const { isAdmin } = useAuth();
  const addToRequest = useAddToRequest();
  const soldOut = item.available === 0;

  return (
    <article className="equipment-card">
      <div className="thumb">
        <EquipmentImage item={item} />
        {item.available !== undefined && <Availability available={item.available} total={item.quantityTotal} compact />}
        <span className="explore-pill" aria-hidden="true">Explore<IconArrowUpRight size={14} /></span>
      </div>
      <div className="body">
        <span className="meta category-tag">{item.category}</span>
        <h3 className="card-title">
          <Link to={`/equipment/${item._id}`} className="stretched-link">{item.name}</Link>
        </h3>
        <p className="desc">{item.description}</p>
        <div className="foot">
          <span className="price">{formatCurrency(item.dailyRate)} <small>/ day</small></span>
          {!isAdmin && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary add-btn"
              disabled={soldOut}
              onClick={() => addToRequest({ equipment: item, quantity: 1 })}
              aria-label={`Add ${item.name} to request`}
            >
              <Plus size={16} /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
