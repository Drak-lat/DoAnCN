import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import { updateProduct, getProductById, getCategories } from '../../../services/productService';
import './ProductForm.css';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [currentImage, setCurrentImage] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = useCallback(async () => {
    try {
      const [productRes, categoriesRes] = await Promise.all([
        getProductById(id),
        getCategories()
      ]);

      if (productRes.data.success) {
        const product = productRes.data.data;
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
          setCurrentImage(product.image_product);
          setPreview(`http://localhost:3000/uploads/products/${product.image_product}`);
        }
      }

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      setMessage({ type: 'error', text: 'Không thể tải thông tin sản phẩm' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    
    if (!validate()) return;
    
    setSaving(true);
    setErrors({});
    setMessage({ type: '', text: '' });
    
    try {
      const fd = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          fd.append(key, formData[key]);
        }
      });
      
      if (imageFile) {
        fd.append('image', imageFile);
      }

      const res = await updateProduct(id, fd);

      if (res?.data?.success) {
        setMessage({ type: 'success', text: 'Cập nhật sản phẩm thành công!' });
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: res?.data?.msg || 'Cập nhật sản phẩm thất bại' });
      }
    } catch (err) {
      console.error('Update product error:', err);
      setMessage({ 
        type: 'error', 
        text: err?.response?.data?.msg || 'Lỗi server' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">Đang tải...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="product-form-container">
        <div className="product-form-header">
          <h1>Chỉnh sửa sản phẩm</h1>
          <button 
            className="btn-back"
            onClick={() => navigate('/admin/products')}
          >
            ← Quay lại
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          {/* Thông tin cơ bản */}
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Tên sản phẩm <span className="required">*</span></label>
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
                <label>Danh mục <span className="required">*</span></label>
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
                rows="6"
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>
          </div>

          {/* Hình ảnh */}
          <div className="form-section">
            <h3>Hình ảnh sản phẩm</h3>
            
            {currentImage && !imageFile && (
              <div className="current-image-display">
                <p style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '10px' }}>
                  Ảnh hiện tại:
                </p>
                <img 
                  src={`http://localhost:3000/uploads/products/${currentImage}`}
                  alt="Current product" 
                  style={{ 
                    maxWidth: '300px', 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px',
                    background: 'white',
                    marginBottom: '15px'
                  }} 
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Thay đổi ảnh (Tùy chọn)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
              />
              <small>Chỉ chấp nhận file ảnh (JPG, PNG, GIF). Tối đa 5MB. Nếu không chọn ảnh mới, ảnh cũ sẽ được giữ nguyên.</small>
              
              {preview && imageFile && (
                <div className="image-preview">
                  <p style={{ fontWeight: 600, color: '#27ae60', marginTop: '15px', marginBottom: '10px' }}>
                    Ảnh mới (Preview):
                  </p>
                  <img 
                    src={preview} 
                    alt="preview" 
                    style={{ 
                      maxWidth: '300px', 
                      maxHeight: '300px', 
                      objectFit: 'contain',
                      border: '2px solid #27ae60',
                      borderRadius: '8px',
                      padding: '10px',
                      background: 'white'
                    }} 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => navigate('/admin/products')}
              disabled={saving}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={saving}
            >
              {saving ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default EditProduct;