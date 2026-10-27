import Activity from '../models/Activity.js';

// Fire-and-forget audit logging: a failed log must never break the request.
export async function logActivity({ actor, action, entity, entityId, message }) {
  try {
    await Activity.create({
      actor: actor?._id,
      actorName: actor?.name || 'System',
      action,
      entity,
      entityId,
      message,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}
