import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../../../services/productService';
import './ProductModal.css';

function ProductFormModal({ product, categories = [], type, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name_product: '',
    price: '',
    quantity: '',
    dimension: '',
    manufacturer: '',
    page: '',
    author: '',
    publisher: '',
    publisher_year: '',
    text_product: '',
    size: '',
    id_category: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && type === 'edit') {
      setFormData({
        name_product: product.name_product || '',
        price: product.price || '',
        quantity: product.quantity || '',
        dimension: product.dimension || '',
        manufacturer: product.manufacturer || '',
        page: product.page || '',
        author: product.author || '',
        publisher: product.publisher || '',
        publisher_year: product.publisher_year || '',
        text_product: product.text_product || '',
        size: product.size || '',
        id_category: product.id_category || ''
      });
      if (product.image_product) {
        setPreview(`http://localhost:3000/uploads/products/${product.image_product}`);
      }
    } else {
      // Reset form khi thêm mới
      setFormData({
        name_product: '',
        price: '',
        quantity: '',
        dimension: '',
        manufacturer: '',
        page: '',
        author: '',
        publisher: '',
        publisher_year: '',
        text_product: '',
        size: '',
        id_category: ''
      });
      setImageFile(null);
      setPreview(null);
    }
  }, [product, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const validate = () => {
    const err = {};
    if (!formData.name_product || formData.name_product.trim() === '') {
      err.name_product = 'Nhập tên sản phẩm';
    }
    if (formData.price !== '' && (isNaN(Number(formData.price)) || Number(formData.price) < 0)) {
      err.price = 'Giá phải là số dương';
    }
    if (formData.quantity !== '' && (!Number.isInteger(Number(formData.quantity)) || Number(formData.quantity) < 0)) {
      err.quantity = 'Số lượng phải là số nguyên dương';
    }
    if (!formData.id_category) {
      err.id_category = 'Chọn danh mục';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit form:', { type, formData, imageFile }); // DEBUG
    
    if (!validate()) {
      console.log('Validation failed:', errors); // DEBUG
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const fd = new FormData();
      
      // Thêm tất cả các field vào FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          fd.append(key, formData[key]);
        }
      });
      
      // Thêm file ảnh nếu có
      if (imageFile) {
        fd.append('image', imageFile);
      }

      console.log('FormData prepared:', Array.from(fd.entries())); // DEBUG

      let res;
      if (type === 'add') {
        console.log('Creating product...'); // DEBUG
        res = await createProduct(fd);
      } else {
        console.log('Updating product:', product.id_product); // DEBUG
        res = await updateProduct(product.id_product, fd);
      }

      console.log('Response:', res.data); // DEBUG

      if (res?.data?.success) {
        onSave && onSave();
      } else {
        setErrors({ submit: res?.data?.msg || 'Lưu thất bại' });
      }
    } catch (err) {
      console.error('Product save error:', err);
      console.error('Error response:', err.response); // DEBUG
      setErrors({ submit: err?.response?.data?.msg || 'Lỗi server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Thông tin cơ bản */}
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Tên sản phẩm <span style={{color: 'red'}}>*</span></label>
                <input 
                  name="name_product" 
                  value={formData.name_product} 
                  onChange={handleChange}
                  className={errors.name_product ? 'error' : ''}
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name_product && <span className="error-text">{errors.name_product}</span>}
              </div>

              <div className="form-group">
                <label>Danh mục <span style={{color: 'red'}}>*</span></label>
                <select 
                  name="id_category" 
                  value={formData.id_category} 
                  onChange={handleChange}
                  className={errors.id_category ? 'error' : ''}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c.id_category} value={c.id_category}>
                      {c.name_category}
                    </option>
                  ))}
                </select>
                {errors.id_category && <span className="error-text">{errors.id_category}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giá (VNĐ)</label>
                <input 
                  type="number"
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange}
                  className={errors.price ? 'error' : ''}
                  placeholder="0"
                  min="0"
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label>Số lượng</label>
                <input 
                  type="number"
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleChange}
                  className={errors.quantity ? 'error' : ''}
                  placeholder="0"
                  min="0"
                />
                {errors.quantity && <span className="error-text">{errors.quantity}</span>}
              </div>
            </div>
          </div>

          {/* Chi tiết sản phẩm */}
          <div className="form-section">
            <h3>Chi tiết sản phẩm</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Tác giả</label>
                <input 
                  name="author" 
                  value={formData.author} 
                  onChange={handleChange}
                  placeholder="Tên tác giả"
                />
              </div>

              <div className="form-group">
                <label>Nhà xuất bản</label>
                <input 
                  name="publisher" 
                  value={formData.publisher} 
                  onChange={handleChange}
                  placeholder="Tên nhà xuất bản"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Năm xuất bản</label>
                <input 
                  type="number"
                  name="publisher_year" 
                  value={formData.publisher_year} 
                  onChange={handleChange}
                  placeholder="2024"
                  min="1900"
                  max="2100"
                />
              </div>

              <div className="form-group">
                <label>Số trang</label>
                <input 
                  type="number"
                  name="page" 
                  value={formData.page} 
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kích thước</label>
                <input 
                  name="dimension" 
                  value={formData.dimension} 
                  onChange={handleChange}
                  placeholder="VD: 14x20 cm"
                />
              </div>

              <div className="form-group">
                <label>Nhà sản xuất</label>
                <input 
                  name="manufacturer" 
                  value={formData.manufacturer} 
                  onChange={handleChange}
                  placeholder="Tên nhà sản xuất"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Kích cỡ</label>
              <select name="size" value={formData.size} onChange={handleChange}>
                <option value="">-- Chọn --</option>
                <option value="Nhỏ">Nhỏ</option>
                <option value="Vừa">Vừa</option>
                <option value="Lớn">Lớn</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mô tả sản phẩm</label>
              <textarea 
                name="text_product" 
                value={formData.text_product} 
                onChange={handleChange}
                rows="5"
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>
          </div>

          {/* Hình ảnh */}
          <div className="form-section">
            <h3>Hình ảnh sản phẩm</h3>
            
            <div className="form-group">
              <label>Chọn ảnh</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
              />
              <small>Chỉ chấp nhận file ảnh (JPG, PNG, GIF). Tối đa 5MB</small>
              
              {preview && (
                <div className="image-preview">
                  <p>Xem trước:</p>
                  <img 
                    src={preview} 
                    alt="preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px', 
                      objectFit: 'contain',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      padding: '5px'
                    }} 
                  />
                </div>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose} 
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-save" 
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : (type === 'add' ? 'Thêm mới' : 'Cập nhật')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;