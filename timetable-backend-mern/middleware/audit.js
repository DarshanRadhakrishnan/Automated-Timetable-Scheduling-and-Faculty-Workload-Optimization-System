const AuditLog = require('../models/AuditLog');

const auditLog = (action, target) => {
    return async (req, res, next) => {
        const originalSend = res.send;

        res.send = function (body) {
            res.send = originalSend;

            // Log independent of response success/failure, or filter based on status code if needed
            if (req.user) {
                const logEntry = new AuditLog({
                    user: req.user.id || req.user._id,
                    action: action,
                    target: target,
                    details: {
                        method: req.method,
                        url: req.originalUrl,
                        statusCode: res.statusCode,
                        body: req.body // Be careful with sensitive data
                    },
                    timestamp: new Date()
                });
                logEntry.save().catch(err => console.error('Audit Log Error:', err));
            }

            return res.send(body);
        };
        next();
    };
};

module.exports = auditLog;
