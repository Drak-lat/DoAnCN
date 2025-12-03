const paypal = require('paypal-rest-sdk');

// Cấu hình PayPal
paypal.configure({
    'mode': 'sandbox', // sandbox hoặc live
    'client_id': 'AZUj0iFpYvgmpLgQHLe-jdvjChnwYyilMZMleygsX2dR1bI8oMnAHCbQlzZDQFSdAlv1F96BWeAhYqAo',
    'client_secret': 'EMycazh3J6XluzBcwjLNfsBk1d0L_0D4uhv9tIM7tT_zIE4S5PErvHUhA8zsOD87XRfQm6xPyf0i9uL6'
});

exports.createPayment = (req, res) => {
    console.log("-----------------------------------------");
    console.log("1. Đã nhận request createPayment!");
    console.log("   - Query params:", req.query);

    let amountVND = req.query.amount || 0;
    const platform = req.query.platform || 'web';
    let amountUSD = (amountVND / 25000).toFixed(2);

    console.log(`2. Số tiền: ${amountVND} VND -> ${amountUSD} USD. Platform: ${platform}`);

    // CẤU HÌNH RETURN URL
    let returnUrl, cancelUrl;
    if (platform === 'app') {
        const SERVER_URL = 'http://10.0.2.2:3000'; // Cho máy ảo Android
        returnUrl = `${SERVER_URL}/api/customer/paypal_success?platform=app`;
        cancelUrl = `${SERVER_URL}/api/customer/paypal_cancel?platform=app`;
    } else {
        const SERVER_URL = 'http://localhost:3000'; // Cho Web
        returnUrl = `${SERVER_URL}/api/customer/paypal_success?platform=web`;
        cancelUrl = `${SERVER_URL}/api/customer/paypal_cancel?platform=web`;
    }

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
                    "name": "Don hang HavanaBook",
                    "sku": "001",
                    "price": amountUSD,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": { "currency": "USD", "total": amountUSD },
            "description": "Thanh toan don hang HavanaBook"
        }]
    };

    console.log("3. Bắt đầu gửi request sang PayPal...");

    // GỌI PAYPAL SDK
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log("❌ 4. LỖI TỪ PAYPAL:", JSON.stringify(error, null, 2));
            // TRẢ VỀ LỖI ĐỂ APP KHÔNG BỊ TREO
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
                console.log("⚠️ 5. Không tìm thấy link approval_url trong response!");
                // TRẢ VỀ LỖI ĐỂ APP KHÔNG BỊ TREO
                return res.status(500).json({ message: "Không tìm thấy link thanh toán từ PayPal" });
            }
        }
    });
};

exports.executePayment = (req, res) => {
    // ... Giữ nguyên code cũ của bạn hoặc thêm log tương tự ...
    // Code cũ của bạn ở phần execute ổn, nhưng nên thêm log
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const platform = req.query.platform || 'web';

    console.log(`Nhận request Execute: PayerID=${payerId}, PaymentID=${paymentId}`);

    const execute_payment_json = { "payer_id": payerId };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log("❌ Lỗi Execute:", error);
            if (platform === 'app') return res.redirect('dacnapp://payment/success?status=fail');
            return res.redirect('http://localhost:3001/checkout/success?status=fail');
        } else {
            console.log("✅ Execute thành công!");
            const orderId = payment.id;
            const total = payment.transactions[0].amount.total;

            if (platform === 'app') return res.redirect(`dacnapp://payment/success?orderId=${orderId}&total=${total}&status=success`);
            return res.redirect(`http://localhost:3001/checkout/success?orderId=${orderId}&total=${total}&status=success`);
        }
    });
};

exports.cancelPayment = (req, res) => {
    const platform = req.query.platform || 'web';
    console.log("Khách đã hủy thanh toán");
    if (platform === 'app') return res.redirect('dacnapp://payment/success?status=cancel');
    return res.redirect('http://localhost:3001/checkout/success?status=fail');
};