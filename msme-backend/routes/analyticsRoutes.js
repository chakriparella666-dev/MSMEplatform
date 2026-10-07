const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const path = require('path');

// POST or GET /api/analytics/forecast
router.post('/forecast', (req, res) => {
    try {
        const inputData = req.body || {};
        const scriptPath = path.join(__dirname, '../ml/predict_xgboost.py');
        const jsonArg = JSON.stringify(inputData);

        execFile('python', [scriptPath, jsonArg], (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing XGBoost script:', error, stderr);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to run XGBoost forecast model',
                    error: stderr || error.message
                });
            }

            try {
                const forecastResult = JSON.parse(stdout.trim());
                return res.json(forecastResult);
            } catch (parseErr) {
                console.error('Failed to parse Python XGBoost output:', stdout);
                return res.status(500).json({
                    success: false,
                    message: 'Invalid output from XGBoost model'
                });
            }
        });
    } catch (err) {
        console.error('Analytics route error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/analytics/forecast for quick testing
router.get('/forecast', (req, res) => {
    const inputData = {
        category: req.query.category || 'Textiles',
        price: Number(req.query.price) || 850,
        stock: Number(req.query.stock) || 50,
        pastSales: Number(req.query.pastSales) || 35,
        month: Number(req.query.month) || 10
    };
    
    const scriptPath = path.join(__dirname, '../ml/predict_xgboost.py');
    const jsonArg = JSON.stringify(inputData);

    execFile('python', [scriptPath, jsonArg], (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, error: stderr || error.message });
        }
        try {
            const forecastResult = JSON.parse(stdout.trim());
            return res.json(forecastResult);
        } catch (parseErr) {
            return res.status(500).json({ success: false, message: 'Parsing error' });
        }
    });
});

module.exports = router;
