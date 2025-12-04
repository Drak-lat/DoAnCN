/* filepath: src/cron/cronJobs.js */
const cron = require('node-cron');
const { Order } = require('../models'); // Đảm bảo đường dẫn đúng tới models
const { Op } = require('sequelize');

const initScheduledJobs = () => {
    // Chạy mỗi 1 tiếng: '0 * * * *'
    // Chạy mỗi phút (để test): '* * * * *'
    cron.schedule('0 * * * *', async () => {
        console.log("⏳ Đang quét các đơn hàng PayPal quá hạn 24h...");

        try {
            // 1. Tính thời gian 24h trước
            const twentyFourHoursAgo = new Date(new Date() - 24 * 60 * 60 * 1000);

            // 2. Tìm các đơn hàng thỏa mãn điều kiện:
            // - Chưa thanh toán
            // - Tạo hơn 24h trước
            // - Chưa bị hủy
            const overdueOrders = await Order.findAll({
                where: {
                    payment_status: 'Chờ thanh toán', // Hoặc trạng thái mặc định của bạn
                    // payment_method: 'PayPal', // Bật dòng này nếu chỉ muốn hủy đơn PayPal
                    order_status: { [Op.ne]: 'Đã hủy' }, // Không lấy đơn đã hủy
                    createdAt: {
                        [Op.lt]: twentyFourHoursAgo // CreatedAt < 24h trước
                    }
                }
            });

            if (overdueOrders.length > 0) {
                console.log(`⚠️ Tìm thấy ${overdueOrders.length} đơn hàng quá hạn.`);

                // 3. Cập nhật trạng thái sang "Đã hủy"
                const orderIds = overdueOrders.map(o => o.id_order);

                await Order.update(
                    {
                        order_status: 'Đã hủy',
                        payment_status: 'Hủy do quá hạn thanh toán'
                    },
                    {
                        where: {
                            id_order: { [Op.in]: orderIds }
                        }
                    }
                );

                console.log(`✅ Đã hủy tự động các đơn: ${orderIds.join(', ')}`);
            } else {
                console.log("✅ Không có đơn hàng nào quá hạn.");
            }

        } catch (error) {
            console.error("❌ Lỗi khi chạy Cron Job hủy đơn:", error);
        }
    });
};

module.exports = initScheduledJobs;