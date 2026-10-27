import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

// Adds equipment to the rental request; guests are sent to log in first and come back afterwards
export default function useAddToRequest() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const notify = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (items) => {
      if (!user) {
        notify('Log in or create an account to request equipment.', 'secondary');
        navigate('/login', { state: { from: location } });
        return false;
      }
      const list = Array.isArray(items) ? items : [items];
      list.forEach(({ equipment, quantity }) => addItem(equipment, quantity));
      notify(
        list.length === 1
          ? `Added ${list[0].quantity} × ${list[0].equipment.name} to your rental request.`
          : `Added ${list.length} items to your rental request.`
      );
      return true;
    },
    [user, addItem, notify, navigate, location]
  );
}
