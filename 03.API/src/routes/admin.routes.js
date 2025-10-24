const express = require("express");
const router = express.Router();
const productCtrl = require("../controllers/admin/product.controller");
const categoryCtrl = require("../controllers/admin/category.controller");
const debugCtrl = require("../controllers/admin/debug.controller");
const adminOnly = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload.middleware");

// Product routes with authentication and admin checks
router.get("/products", adminOnly, productCtrl.getAll);
router.get("/products/:id", adminOnly, productCtrl.getOne);
// Use multer to parse multipart/form-data with single file field 'image_product'
router.post("/products", adminOnly, upload.single('image_product'), productCtrl.create);
router.put("/products/:id", adminOnly, upload.single('image_product'), productCtrl.update);
router.delete("/products/:id", adminOnly, productCtrl.remove);
// Categories (read-only for admin UI)
router.get("/categories", adminOnly, categoryCtrl.getAll);

// Debug route: echo request for multipart/form-data testing
router.post('/debug/echo', adminOnly, upload.single('image_product'), debugCtrl.echo);

module.exports = router;
