const moment = require("moment");
const qs = require("qs");
const crypto = require("crypto");
const config = require("../../config/vnpayConfig");

// 🔧 Hàm sort theo chuẩn VNPAY
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
}

// ============================
//  1. CREATE PAYMENT (Tạo URL thanh toán)
// ============================
exports.createPayment = (req, res) => {
    try {
        // Kiểm tra xem đã điền Config chưa
        if (!config.vnp_TmnCode || !config.vnp_HashSecret) {
            return res.status(500).json({
                message: "Chưa cấu hình VNPAY Key. Hãy kiểm tra file vnpayConfig.js"
            });
        }

        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = moment(new Date()).format('YYYYMMDDHHmmss');

        // Tạo mã đơn hàng ngẫu nhiên
        let orderId = moment(new Date()).format('DDHHmmss') + Math.floor(Math.random() * 1000);

        let amount = req.query.amount;
        let bankCode = req.query.bankCode;

        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;


        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = config.vnp_TmnCode;
        vnp_Params['vnp_Locale'] = config.vnp_Locale;
        vnp_Params['vnp_CurrCode'] = config.vnp_CurrCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = config.vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = date;

        if (bankCode !== null && bankCode !== '' && bankCode !== undefined) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        vnp_Params['vnp_SecureHash'] = signed;
        let vnpUrl = config.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: true });

        console.log("👉 Tạo URL thanh toán thành công:", vnpUrl);

        return res.json({ paymentUrl: vnpUrl });

    } catch (err) {
        console.error("❌ VNPAY ERROR:", err);
        return res.status(500).json({ message: "VNPAY payment error" });
    }
};

// ============================
//  2. VNPAY RETURN (Xử lý khi VNPAY redirect về)
// ============================
exports.vnpayReturn = (req, res) => {
    console.log("🔄 VNPAY đang gọi về Return URL...");
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        // ✅ Checksum đúng
        console.log("✅ Chữ ký hợp lệ.");
        if (vnp_Params['vnp_ResponseCode'] === "00") {
            console.log("💰 Thanh toán THÀNH CÔNG. OrderId:", vnp_Params['vnp_TxnRef']);

            // Trả về JSON để bạn test trên trình duyệt
            res.json({
                status: 'success',
                code: vnp_Params['vnp_ResponseCode'],
                message: 'Thanh toán thành công',
                data: vnp_Params
            });
        } else {
            console.log("❌ Thanh toán THẤT BẠI. Code:", vnp_Params['vnp_ResponseCode']);

            res.json({
                status: 'fail',
                code: vnp_Params['vnp_ResponseCode'],
                message: 'Thanh toán thất bại'
            });
        }
    } else {
        console.log("⛔ Sai chữ ký (Checksum failed).");
        res.json({ status: 'error', message: 'Sai chữ ký (Checksum failed)' });
    }
};