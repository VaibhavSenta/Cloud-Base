const pushService = require('../services/push.service');

const subscribe = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const result = await pushService.saveSubscription(adminId, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const getPublicKey = async (req, res) => {
    res.json({ publicKey: pushService.VAPID_PUBLIC_KEY });
};

module.exports = {
    subscribe,
    getPublicKey
};
