import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../../services/productService";
import categoryMap from "../../constants/categoryMap"; // ánh xạ id -> tên thể loại
import { getCategories } from "../../services/categoryService";
import "./AddBook.css";

export default function AddEditBook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name_product: "",
    author: "",
    price: "",
    quantity: "",
    publisher_year: "",
    id_category: "",
    text_product: "",
    image_product: null,
    current_image: "", // Store the current image URL
  });

  // 📦 Nếu là "Sửa" thì tải dữ liệu cũ
  useEffect(() => {
    if (isEditMode) {
      const fetchBook = async () => {
        try {
          setLoading(true);
          const res = await getProductById(id);
          // API may return either { success: true, data: product } (response.data)
          // or directly the product object depending on service wrapper.
          const book = (res && (res.data || res)) || {};
          // for debugging if categories/value missing
          // console.debug('fetchBook result:', res, 'book:', book);

            setFormData({
            name_product: book.name_product || "",
            author: book.author || "",
            price: book.price || "",
            quantity: book.quantity || "",
            publisher_year: book.publisher_year || "",
            // ensure id_category is a string for controlled select value
            id_category: book.id_category != null ? String(book.id_category) : "",
            text_product: book.text_product || "",
            image_product: null,
            current_image: book.image_product || "",
          });
        } catch (err) {
          alert("❌ Không tải được thông tin sách!");
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }
  }, [id, isEditMode]);

  // Load categories for the select (try backend first, fallback to categoryMap)
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (!mounted) return;
        // data might be array of objects { id_category, name_category }
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
          setCategories(data.map((c) => ({ id: String(c.id_category), name: c.name_category })));
        } else {
          // fallback to categoryMap
          const mapArray = Object.entries(categoryMap || {}).map(([id, name]) => ({ id: String(id), name }));
          setCategories(mapArray);
        }
      } catch (err) {
        // fallback
        const mapArray = Object.entries(categoryMap || {}).map(([id, name]) => ({ id: String(id), name }));
        setCategories(mapArray);
      }
    };
    fetchCategories();
    return () => (mounted = false);
  }, []);

  // 🖊️ Xử lý khi nhập input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image_product: file,
      }));
    }
  };

  // 💾 Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Kiểm tra dữ liệu cơ bản (defensive: tránh .trim trên undefined)
      if (!(formData.name_product || '').trim())
        throw new Error("Vui lòng nhập tên sách!");
      if (!formData.price) throw new Error("Vui lòng nhập giá!");
      if (!formData.quantity) throw new Error("Vui lòng nhập số lượng!");

      const data = new FormData();
      data.append("name_product", formData.name_product.trim());
      data.append("price", formData.price);
      data.append("quantity", formData.quantity);
  if ((formData.author || '').trim()) data.append("author", formData.author);
      if (formData.publisher_year)
        data.append("publisher_year", formData.publisher_year);
      if (formData.id_category)
        data.append("id_category", formData.id_category);
      if ((formData.text_product || '').trim())
        data.append("text_product", formData.text_product);
      if (formData.image_product instanceof File)
        data.append("image_product", formData.image_product);

      if (isEditMode) {
        try {
          await updateProduct(id, data);
          alert("✅ Cập nhật sách thành công!");
        } catch (err) {
          console.error('Update error response:', err?.response || err);
          throw err;
        }
      } else {
        try {
          await createProduct(data);
          alert("✅ Thêm sách thành công!");
        } catch (err) {
          console.error('Create error response:', err?.response || err);
          throw err;
        }
      }

      navigate("/admin/books");
    } catch (error) {
        console.error("❌ Lỗi:", error, error?.response?.data);
        const serverMsg = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi lưu sách!";
        alert(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addbook-container">
      <h2 className="addbook-title">
        {isEditMode ? "Chỉnh sửa sách" : "Thêm sách mới"}
      </h2>

      <form onSubmit={handleSubmit} className="addbook-form">
        <div className="form-group">
          <label>Tên sách</label>
          <input
            type="text"
            name="name_product"
            value={formData.name_product}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Tác giả</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Giá</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Số lượng</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Năm xuất bản</label>
          <input
            type="number"
            name="publisher_year"
            value={formData.publisher_year}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        {/* 🟣 Chọn thể loại theo id_category */}
        <div className="form-group">
          <label>Thể loại</label>
          <select
            name="id_category"
            value={formData.id_category}
            onChange={handleChange}
          >
            <option value="">-- Chọn thể loại --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {/* Hiển thị tên thể loại được chọn tự động */}
          {formData.id_category && (
            <div style={{ marginTop: "6px", fontSize: "13px", color: "#888" }}>
              Thể loại đã chọn: {categories.find((c) => c.id === formData.id_category)?.name || categoryMap[formData.id_category] || "(Không xác định)"}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Hình ảnh</label>
          {isEditMode && formData.current_image && (
            <div className="current-image">
              <img 
                src={`http://localhost:3000${formData.current_image}`} 
                alt="Ảnh hiện tại"
              />
              <p className="image-info">Ảnh hiện tại</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {isEditMode && (
            <p className="image-info">
              Nếu không chọn ảnh mới, ảnh cũ sẽ được giữ nguyên.
            </p>
          )}
          {formData.image_product && (
            <div className="image-preview">
              <p className="image-info">
                Ảnh đã chọn: {formData.image_product.name}
              </p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            name="text_product"
            value={formData.text_product}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <button
            type="button"
            className="btn-reset"
            onClick={() => navigate("/admin/books")}
            disabled={loading}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
