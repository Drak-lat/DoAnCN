/* filepath: d:\DACN06\DoAnCN\02.Web\src\controllers\PayPalController.js */
const paypal = require('paypal-rest-sdk');
const { Order } = require('../../models'); // ✅ SỬA: Import Model để update DB

// Cấu hình PayPal
paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AZUj0iFpYvgmpLgQHLe-jdvjChnwYyilMZMleygsX2dR1bI8oMnAHCbQlzZDQFSdAlv1F96BWeAhYqAo',
    'client_secret': 'EMycazh3J6XluzBcwjLNfsBk1d0L_0D4uhv9tIM7tT_zIE4S5PErvHUhA8zsOD87XRfQm6xPyf0i9uL6'
});

exports.createPayment = (req, res) => {
    console.log("-----------------------------------------");
    console.log("1. Đã nhận request createPayment!");

    // ✅ SỬA: Nhận orderId từ frontend gửi lên
    const orderId = req.query.orderId;
    let amountVND = req.query.amount || 0;
    const platform = req.query.platform || 'web';

    // Convert tiền
    let amountUSD = (amountVND / 25000).toFixed(2);

    console.log(`   - OrderID: ${orderId}`);
    console.log(`   - Số tiền: ${amountVND} VND -> ${amountUSD} USD. Platform: ${platform}`);

    // Xử lý URL Redirect
    let returnUrl, cancelUrl;
    const SERVER_URL = platform === 'app' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

    // ✅ QUAN TRỌNG: Gắn orderId vào URL trả về để executePayment dùng
    const queryParams = `platform=${platform}&orderId=${orderId}`;
    returnUrl = `${SERVER_URL}/api/customer/paypal_success?${queryParams}`;
    cancelUrl = `${SERVER_URL}/api/customer/paypal_cancel?${queryParams}`;

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

    console.log("3. Bắt đầu gửi request sang PayPal...");

    // GỌI PAYPAL SDK
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log("❌ 4. LỖI TỪ PAYPAL:", JSON.stringify(error, null, 2));
            return res.status(500).json({
                message: "Lỗi tạo thanh toán PayPal",
                details: error
            });
        } else {
            console.log("✅ 4. PayPal trả về thành công. Đang tìm link...");
            let approvalUrl = null;
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    approvalUrl = payment.links[i].href;
                    break;
                }
            }

            if (approvalUrl) {
                console.log("✅ 5. Đã tìm thấy Link:", approvalUrl);
                return res.json({ paymentUrl: approvalUrl });
            } else {
                return res.status(500).json({ message: "Không tìm thấy link thanh toán từ PayPal" });
            }
        }
    });
};

exports.executePayment = (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const platform = req.query.platform || 'web';

    // ✅ SỬA: Lấy orderId từ URL (do createPayment truyền qua)
    const systemOrderId = req.query.orderId;

    console.log(`Nhận request Execute: PayerID=${payerId}, OrderID=${systemOrderId}`);

    const execute_payment_json = { "payer_id": payerId };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
        if (error) {
            console.log("❌ Lỗi Execute:", error);
            const failUrl = platform === 'app'
                ? 'dacnapp://payment/success?status=fail'
                : 'http://localhost:3001/checkout/success?status=fail';
            return res.redirect(failUrl);
        } else {
            console.log("✅ Execute thành công!");
            const total = payment.transactions[0].amount.total;

            // ✅ QUAN TRỌNG: Cập nhật DB
            if (systemOrderId && systemOrderId !== 'undefined') {
                try {
                    await Order.update(
                        {
                            payment_status: 'Đã thanh toán',
                            order_status: 'Đã xác nhận' // Tùy chọn, có thể giữ 'Chờ xác nhận' nếu muốn admin duyệt
                        },
                        { where: { id_order: systemOrderId } }
                    );
                    console.log(`✅ Đã cập nhật trạng thái thanh toán cho đơn hàng #${systemOrderId}`);
                } catch (err) {
                    console.error('❌ Lỗi cập nhật trạng thái đơn hàng:', err);
                }
            } else {
                console.warn('⚠️ Không tìm thấy orderId hệ thống để cập nhật trạng thái!');
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
    console.log(`Khách đã hủy thanh toán đơn #${systemOrderId}`);

    // Trả về status cancel để frontend hiển thị đúng thông báo
    const cancelUrl = platform === 'app'
        ? 'dacnapp://payment/success?status=cancel'
        : 'http://localhost:3001/checkout/success?status=cancel';

    return res.redirect(cancelUrl);
};