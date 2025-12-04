/* filepath: d:\DACN06\DoAnCN\02.Web\src\controllers\PayPalController.js */
const paypal = require('paypal-rest-sdk');

// ✅ SỬA 1: Chỉnh lại đường dẫn import (dùng ../ thay vì ../../)
// Nếu file này nằm ở src/controllers/PayPalController.js thì models ở src/models
const { Order } = require('../../models');

// Cấu hình PayPal
paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AZUj0iFpYvgmpLgQHLe-jdvjChnwYyilMZMleygsX2dR1bI8oMnAHCbQlzZDQFSdAlv1F96BWeAhYqAo',
    'client_secret': 'EMycazh3J6XluzBcwjLNfsBk1d0L_0D4uhv9tIM7tT_zIE4S5PErvHUhA8zsOD87XRfQm6xPyf0i9uL6'
});

exports.createPayment = async (req, res) => {
    console.log("=========================================");
    console.log("1. Đã nhận request createPayment!");

    // ✅ DEBUG: In ra để kiểm tra xem nhận được gì
    console.log("   - Query Params:", req.query);

    // Kiểm tra xem Model Order có load được không
    if (!Order) {
        console.error("❌ LỖI NGHIÊM TRỌNG: Không tìm thấy Model 'Order'. Kiểm tra lại đường dẫn require('../models')");
        return res.status(500).json({ message: "Lỗi Server: Không load được Database Model" });
    }

    const orderId = req.query.orderId;
    let amountVND = req.query.amount || 0;
    const platform = req.query.platform || 'web';

    // === BƯỚC 1: KIỂM TRA ĐƠN HÀNG ===
    try {
        console.log(`2. Đang tìm đơn hàng #${orderId} trong DB...`);

        // Dùng await để đợi DB trả về kết quả
        const order = await Order.findOne({ where: { id_order: orderId } });

        if (!order) {
            console.log("❌ Không tìm thấy đơn hàng!");
            return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
        }

        console.log(`   - Trạng thái đơn: ${order.order_status}, Thanh toán: ${order.payment_status}`);

        if (order.order_status === 'Đã hủy') {
            console.log("❌ Đơn hàng đã bị hủy!");
            return res.status(400).json({ message: "Đơn hàng đã bị hủy!" });
        }
        if (order.payment_status === 'Đã thanh toán') {
            console.log("❌ Đơn hàng đã thanh toán rồi!");
            return res.status(400).json({ message: "Đơn hàng đã được thanh toán!" });
        }

        console.log("✅ Đơn hàng hợp lệ. Đang tạo link PayPal...");

    } catch (err) {
        console.error("❌ Lỗi CRASH khi kiểm tra DB:", err);
        return res.status(500).json({ message: "Lỗi server kiểm tra đơn hàng", error: err.message });
    }

    // === BƯỚC 2: TẠO THANH TOÁN ===
    let amountUSD = (amountVND / 25000).toFixed(2);

    // Config URL
    const SERVER_URL = platform === 'app' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
    const queryParams = `platform=${platform}&orderId=${orderId}`;
    const returnUrl = `${SERVER_URL}/api/customer/paypal_success?${queryParams}`;
    const cancelUrl = `${SERVER_URL}/api/customer/paypal_cancel?${queryParams}`;

    const create_payment_json = {
        "intent": "sale",
        "payer": { "payment_method": "paypal" },
        "redirect_urls": {
            "return_url": returnUrl,
            "cancel_url": cancelUrl
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": `Don hang #${orderId}`,
                    "sku": orderId ? orderId.toString() : "001",
                    "price": amountUSD,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": { "currency": "USD", "total": amountUSD },
            "description": `Thanh toan don hang #${orderId}`
        }]
    };

    console.log("3. Gửi request sang PayPal...");

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.error("❌ Lỗi PayPal Create:", error);
            // Log chi tiết lỗi validation từ PayPal nếu có
            if (error.response) console.error("   Details:", JSON.stringify(error.response));
            return res.status(500).json({ message: "Lỗi tạo thanh toán PayPal", details: error });
        } else {
            console.log("✅ PayPal phản hồi thành công.");
            let approvalUrl = null;
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    approvalUrl = payment.links[i].href;
                    break;
                }
            }

            if (approvalUrl) {
                console.log("✅ Link thanh toán:", approvalUrl);
                return res.json({ paymentUrl: approvalUrl });
            } else {
                return res.status(500).json({ message: "Không tìm thấy link thanh toán" });
            }
        }
    });
};

exports.executePayment = (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const platform = req.query.platform || 'web';
    const systemOrderId = req.query.orderId;

    console.log(`-----------------------------------------`);
    console.log(`Nhận request Execute: PayerID=${payerId}, OrderID=${systemOrderId}`);

    const execute_payment_json = { "payer_id": payerId };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
        if (error) {
            console.log("❌ Lỗi Execute Payment:", error);
            const failUrl = platform === 'app'
                ? 'dacnapp://payment/success?status=fail'
                : 'http://localhost:3001/checkout/success?status=fail';
            return res.redirect(failUrl);
        } else {
            console.log("✅ Thanh toán thành công!");
            const total = payment.transactions[0].amount.total;

            if (systemOrderId && systemOrderId !== 'undefined') {
                try {
                    await Order.update(
                        { payment_status: 'Đã thanh toán', order_status: 'Đã xác nhận' },
                        { where: { id_order: systemOrderId } }
                    );
                    console.log(`✅ DB Update: Đơn #${systemOrderId} -> Đã thanh toán`);
                } catch (err) {
                    console.error('❌ Lỗi DB Update:', err);
                }
            }

            const successUrl = platform === 'app'
                ? `dacnapp://payment/success?orderId=${systemOrderId}&total=${total}&status=success`
                : `http://localhost:3001/checkout/success?orderId=${systemOrderId}&total=${total}&status=success`;

            return res.redirect(successUrl);
        }
    });
};

exports.cancelPayment = (req, res) => {
    const platform = req.query.platform || 'web';
    const systemOrderId = req.query.orderId;
    console.log(`⚠️ Hủy thanh toán đơn #${systemOrderId}`);
    const cancelUrl = platform === 'app' ? 'dacnapp://payment/success?status=cancel' : 'http://localhost:3001/checkout/success?status=cancel';
    return res.redirect(cancelUrl);
};