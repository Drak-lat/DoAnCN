module.exports = {
    // 👇 Lát nhận mail, copy mã TmnCode paste vào giữa dấu nháy ""
    vnp_TmnCode: "",

    // 👇 Lát nhận mail, copy chuỗi HashSecret paste vào giữa dấu nháy ""
    vnp_HashSecret: "",

    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",

    // 👇 Đã sửa về Localhost. Lưu ý: Nếu server bạn chạy cổng khác 3000 thì sửa số 3000 lại
    vnp_ReturnUrl: "http://localhost:3000/api/customer/vnpay_return",

    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
};