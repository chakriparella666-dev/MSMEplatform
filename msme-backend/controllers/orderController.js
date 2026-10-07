const Order = require('../models/Order');
const Product = require('../models/Product');
const { runXGBoostForecast } = require('../services/xgboostService');

// @desc    Get orders for a seller
// @route   GET /api/orders/seller
// @access  Private/Seller
exports.getSellerOrders = async (req, res) => {
  try {
    // Find orders containing products from this seller
    const orders = await Order.find({ 'products.seller': req.user.id })
      .populate('buyer', 'name email avatar')
      .populate('products.product', 'name images category');

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Seller
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify if seller owns any product in this order (optional security)
    const isSeller = order.products.some(p => p.seller.toString() === req.user.id.toString());
    if (!isSeller) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get seller stats
// @route   GET /api/orders/seller/stats
// @access  Private/Seller
exports.getSellerStats = async (req, res) => {
  try {
    const orders = await Order.find({ 'products.seller': req.user.id, status: 'Delivered' });
    
    const totalSales = orders.reduce((acc, order) => {
      const sellerProducts = order.products.filter(p => p.seller.toString() === req.user.id.toString());
      const sellerTotal = sellerProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      return acc + sellerTotal;
    }, 0);

    const activeOrders = await Order.countDocuments({ 
      'products.seller': req.user.id, 
      status: { $in: ['Ordered', 'Dispatched', 'Shipped'] } 
    });

    // Calculate daily revenue for the current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Start of month (local time)
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    // End of month (local time)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const currentMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= startOfMonth && orderDate <= endOfMonth;
    });
    
    const dailyData = {};
    const daysInMonth = endOfMonth.getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      dailyData[d] = 0;
    }

    currentMonthOrders.forEach(order => {
      const day = new Date(order.createdAt).getDate();
      const sellerProducts = order.products.filter(p => p.seller.toString() === req.user.id.toString());
      const sellerTotal = sellerProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      dailyData[day] += sellerTotal;
    });

    const dailyRevenue = Object.keys(dailyData).sort((a,b) => a-b).map(day => ({
      day: parseInt(day),
      revenue: dailyData[day]
    }));

    console.log(`[Stats] Month: ${currentMonth + 1}, Year: ${currentYear}, Orders found: ${currentMonthOrders.length}`);

    res.status(200).json({ 
      success: true, 
      data: { 
        totalSales, 
        totalOrders: orders.length,
        activeOrders,
        dailyRevenue,
        month: now.toLocaleString('default', { month: 'long' }),
        year: currentYear
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get demand forecast for a seller
// @route   GET /api/orders/seller/forecast
// @access  Private/Seller
exports.getSellerForecast = async (req, res) => {
  try {
    const orders = await Order.find({ 
      'products.seller': req.user.id, 
      status: { $in: ['Ordered', 'Packed', 'Dispatched', 'Shipped', 'Delivered'] } 
    });

    const products = await Product.find({ seller: req.user.id });

    // Step 1: Real XGBoost Demand Forecasting & Optimization Logic
    const forecastAnalytics = products.map(product => {
      const productSales = [];
      const prodIdStr = product._id.toString();

      orders.forEach(order => {
        order.products.forEach(item => {
          const itemProdId = item.product?._id ? item.product._id.toString() : item.product?.toString();
          if (itemProdId === prodIdStr) {
            productSales.push({ date: new Date(order.createdAt), qty: item.quantity });
          }
        });
      });

      // Calculate historical sales
      const totalSold = productSales.reduce((acc, s) => acc + s.qty, 0);
      const dateNow = new Date();
      const last30Days = new Date(dateNow.getTime() - (30 * 24 * 60 * 60 * 1000));
      const recentSales = productSales.filter(s => s.date >= last30Days).reduce((acc, s) => acc + s.qty, 0);

      // Invoke XGBoost python model
      const xgbResult = runXGBoostForecast({
        category: product.category || 'Textiles',
        price: product.price || 500,
        stock: product.totalStock || 0,
        pastSales: totalSold || 10,
        month: dateNow.getMonth() + 1
      });

      const predictedDemand30 = xgbResult.predicted30DayDemand;
      const recommendedStock = xgbResult.recommendedStock;

      let inventoryStatus = "optimal";
      if (xgbResult.alertType === "UNDERSTOCK_WARNING") inventoryStatus = "understock";
      if (xgbResult.alertType === "OVERSTOCK_WARNING") inventoryStatus = "overstock";

      const suggestions = [
        `XGBoost Forecast Error: ${xgbResult.forecastError}% (Accuracy: ${xgbResult.accuracyScore}%)`,
        `Recommended 30-Day Inventory: ${recommendedStock} units.`
      ];
      if (recentSales > 5) suggestions.push("High consumer interest. Consider maintaining safety stock.");

      return {
        product_id: product._id,
        name: product.name,
        category: product.category,
        current_stock: product.totalStock,
        total_sold: totalSold,
        predicted_demand: predictedDemand30,
        recommended_stock: recommendedStock,
        accuracy_score: xgbResult.accuracyScore,
        forecast_error: xgbResult.forecastError,
        alert_message: xgbResult.alertMessage,
        chart_data: xgbResult.chartData,
        forecast: [
          { period: 'Week 1', quantity: xgbResult.weeklyForecast[0] },
          { period: 'Week 2', quantity: xgbResult.weeklyForecast[1] },
          { period: 'Week 3', quantity: xgbResult.weeklyForecast[2] },
          { period: 'Week 4', quantity: xgbResult.weeklyForecast[3] }
        ],
        inventory_alert: {
          status: inventoryStatus,
          recommended_stock: recommendedStock,
          action: xgbResult.alertMessage
        },
        insights: suggestions,
        trend: recentSales > 0 ? "Growing Demand (XGBoost)" : "Stable Demand"
      };
    });

    // Final Recommendation List
    const recommendations = forecastAnalytics
      .filter(f => f.inventory_alert.status !== 'optimal')
      .map(f => f.inventory_alert.action);

    res.status(200).json({ 
      success: true, 
      data: forecastAnalytics,
      global_recommendations: [...recommendations, "Consider seasonal stocking for upcoming regional festivals."]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get buyer's own orders
// @route   GET /api/orders/my-orders
// @access  Private/Buyer
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('products.product', 'name images price')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Generate waybill (Mock Shiprocket API)
// @route   POST /api/orders/:id/generate-waybill
// @access  Private/Seller
exports.generateWaybill = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Mock AWB generation
    const awb = 'SR' + Math.random().toString(36).substring(2, 10).toUpperCase();
    order.trackingId = awb;
    order.awbNumber = awb;
    order.logisticsProvider = 'Shiprocket';
    order.status = 'Dispatched';
    await order.save();

    res.status(200).json({ success: true, trackingId: awb, message: 'Waybill generated via Shiprocket Mock' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Assign carrier & AWB to an order
// @route   PUT /api/orders/:id/assign-carrier
// @access  Private/Seller
exports.assignCarrier = async (req, res) => {
  try {
    const { carrier, trackingId, status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isSeller = order.products.some(p => p.seller.toString() === req.user.id.toString());
    if (!isSeller) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (carrier) order.logisticsProvider = carrier;
    if (trackingId) order.trackingId = trackingId;
    if (status) order.status = status;
    await order.save();

    res.status(200).json({ success: true, data: order, message: `Order assigned to ${carrier}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get order by tracking ID
// @route   GET /api/orders/track/:trackingId
// @access  Private/Seller
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId })
      .populate('buyer', 'name email')
      .populate('products.product', 'name images');
    if (!order) return res.status(404).json({ success: false, message: 'No order found with this tracking ID' });
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
