const paypal = require('paypal-rest-sdk');

// Cấu hình PayPal
paypal.configure({
    'mode': 'sandbox', // sandbox hoặc live
    'client_id': 'AZUj0iFpYvgmpLgQHLe-jdvjChnwYyilMZMleygsX2dR1bI8oMnAHCbQlzZDQFSdAlv1F96BWeAhYqAo',
    'client_secret': 'EMycazh3J6XluzBcwjLNfsBk1d0L_0D4uhv9tIM7tT_zIE4S5PErvHUhA8zsOD87XRfQm6xPyf0i9uL6'
});

// ==========================================
// 1. TẠO THANH TOÁN
// ==========================================
exports.createPayment = (req, res) => {
    // Lấy số tiền từ FE (VND)
    let amountVND = req.query.amount || 0;

    // Đổi sang USD (Vì PayPal không nhận VND)
    let amountUSD = (amountVND / 25000).toFixed(2);

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            // ⚠️ QUAN TRỌNG: Link này phải trỏ về BACKEND (Port 3000)
            // Để Backend nhận được thông báo từ PayPal và xử lý tiếp
            "return_url": "http://localhost:3000/api/customer/paypal_success",
            "cancel_url": "http://localhost:3000/api/customer/paypal_cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Don hang HavanaBook",
                    "sku": "001",
                    "price": amountUSD,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amountUSD
            },
            "description": "Thanh toan don hang HavanaBook"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log("❌ Lỗi tạo thanh toán:", error);
            res.status(500).json({ error });
        } else {
            // Tìm link approval_url để trả về cho FE redirect
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    // Trả về link thanh toán cho React mở ra
                    res.json({ paymentUrl: payment.links[i].href });
                }
            }
        }
    });
};

// ==========================================
// 2. XỬ LÝ KẾT QUẢ (EXECUTE)
// ==========================================
exports.executePayment = (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log("❌ Lỗi execute:", error.response);

            // ⚠️ Redirect về FRONTEND (Port 3001) báo lỗi
            return res.redirect('http://localhost:3001/checkout/success?status=fail');
        } else {
            console.log("✅ Thanh toán PayPal thành công!");

            // Lấy thông tin
            const orderId = payment.id;
            const total = payment.transactions[0].amount.total;
            const orderStatus = 'PAID';

            // TODO: Viết code Update Database của bạn ở đây (Order.update...)

            // ⚠️ Redirect về FRONTEND (Port 3001) báo thành công
            // Truyền kèm thông tin orderId, total để React hiển thị
            return res.redirect(`http://localhost:3001/checkout/success?orderId=${orderId}&total=${total}&status=success`);
        }
    });
};

// ==========================================
// 3. XỬ LÝ KHI KHÁCH HỦY
// ==========================================
exports.cancelPayment = (req, res) => {
    // Redirect về Frontend báo thất bại/hủy
    return res.redirect('http://localhost:3001/checkout/success?status=fail');
};