const DriverSchedulerService = require('../services/DriverSchedulerService');

module.exports = {
    saveDriverScheduler: async (req, res) => {
        try {
            const result = await DriverSchedulerService.saveDriverScheduler(req.body);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: "Error: " + err.message
                }
            });
        }
    },

    saveDriverMultipleScheduler: async (req, res) => {
        try {
            const result = await DriverSchedulerService.saveDriverMultipleScheduler(req.body);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: "Error: " + err.message
                }
            });
        }
    },

    getAllDriverScheduler: async (req, res) => {
        try {
            const result = await DriverSchedulerService.getAllDriverScheduler(req.query);
            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: { code: 500, message: err.message }
            });
        }
    },

    detail: async (req, res) => {
        try {
            const result = await DriverSchedulerService.getDetail(req.params.id);
            return res.status(200).json(result);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: { code: 400, message: err.message }
            });
        }
    },

    update: async (req, res) => {
        try {
            const result = await DriverSchedulerService.update(req.body);
            return res.status(200).json(result);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: { code: 400, message: err.message }
            });
        }
    },

    deleteSelectedSlot: async (req, res) => {
        try {
            const result = await DriverSchedulerService.deleteSelectedSlot(req.body.id);
            return res.status(200).json(result);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: err
            });
        }
    }
};