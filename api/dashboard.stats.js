app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const placedOrders = await Order.countDocuments({ status: 'placed' });
        const outForDelivery = await Order.countDocuments({ status: 'out for delivery' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        const cashOrders = await Order.aggregate([
            { $match: { paymentMethod: 'cash' } },
            { $group: { _id: null, totalAmount: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
        ]);

        const visaOrders = await Order.aggregate([
            { $match: { paymentMethod: 'visa' } },
            { $group: { _id: null, totalAmount: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
        ]);

        const mostDeliveredDistricts = await Order.aggregate([
            { $group: { _id: '$district', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        const highestSellingDistricts = await Listing.aggregate([
            { $group: { _id: '$district', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        const highestSellingProductTypes = await Order.aggregate([
            { $group: { _id: '$productType', count: { $sum: 1 }, totalAmount: { $sum: '$totalPrice' } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 },
        ]);

        const topSellingUsers = await Order.aggregate([
            { $group: { _id: '$sellerId', totalSales: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
            { $sort: { totalSales: -1 } },
            { $limit: 5 },
        ]);

        const topBuyingUsers = await Order.aggregate([
            { $group: { _id: '$buyerId', totalPurchases: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
            { $sort: { totalPurchases: -1 } },
            { $limit: 5 },
        ]);

        res.json({
            totalOrders,
            placedOrders,
            outForDelivery,
            deliveredOrders,
            cancelledOrders,
            cashOrders: cashOrders[0] || { count: 0, totalAmount: 0 },
            visaOrders: visaOrders[0] || { count: 0, totalAmount: 0 },
            mostDeliveredDistricts: mostDeliveredDistricts.map((d) => ({
                label: d._id,
                value: d.count,
            })),
            highestSellingDistricts: highestSellingDistricts.map((d) => ({
                label: d._id,
                value: d.count,
            })),
            highestSellingProductTypes: highestSellingProductTypes.map((p) => ({
                label: p._id,
                value: `${p.count} Orders | ${p.totalAmount} EGP`,
            })),
            topSellingUsers: topSellingUsers.map((u) => ({ label: u._id, value: u.totalSales })),
            topBuyingUsers: topBuyingUsers.map((u) => ({ label: u._id, value: u.totalPurchases })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});