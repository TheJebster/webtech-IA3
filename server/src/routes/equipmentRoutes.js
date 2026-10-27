import { Router } from 'express';
import {
  listEquipment, equipmentMeta, getEquipment, createEquipment, updateEquipment, deleteEquipment,
} from '../controllers/equipmentController.js';
import { optionalAuth, protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  idParam, createEquipmentRules, updateEquipmentRules, listEquipmentRules, availabilityRules,
} from '../validators/equipment.js';

const router = Router();

// Read — public storefront (guests see active items; signed-in admins also see hidden ones)
router.get('/', optionalAuth, listEquipmentRules, validate, listEquipment);
router.get('/meta', optionalAuth, equipmentMeta);
router.get('/:id', optionalAuth, idParam, availabilityRules, validate, getEquipment);

// Write — admins only
router.post('/', protect, requireRole('admin'), createEquipmentRules, validate, createEquipment);
router.put('/:id', protect, requireRole('admin'), updateEquipmentRules, validate, updateEquipment);
router.delete('/:id', protect, requireRole('admin'), idParam, validate, deleteEquipment);

export default router;
