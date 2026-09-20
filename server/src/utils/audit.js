import AuditLog from '../models/AuditLog.js';

export function recordAudit(req, action, resource, resourceId, previous, next) {
  return AuditLog.create({ actor: req.user.id, action, resource, resourceId: String(resourceId || ''), previous, next, ip: req.ip }).catch(error => {
    console.error('AUDIT_LOG_FAILED', error.message);
  });
}
