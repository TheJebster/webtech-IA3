import { Router } from 'express';
import {
  listEquipment, equipmentMeta, getEquipment, createEquipment, updateEquipment, deleteEquipment,
} from '../controllers/equipmentController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  idParam, createEquipmentRules, updateEquipmentRules, listEquipmentRules,
} from '../validators/equipment.js';

const router = Router();

// Every equipment route needs a logged-in user
router.use(protect);

// Read — any role
router.get('/', listEquipmentRules, validate, listEquipment);
router.get('/meta', equipmentMeta);
router.get('/:id', idParam, validate, getEquipment);

// Write — admins only
router.post('/', requireRole('admin'), createEquipmentRules, validate, createEquipment);
router.put('/:id', requireRole('admin'), updateEquipmentRules, validate, updateEquipment);
router.delete('/:id', requireRole('admin'), idParam, validate, deleteEquipment);

export default router;
