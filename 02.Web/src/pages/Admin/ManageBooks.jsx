import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ManageBooks.css";
import { getProducts, deleteProduct } from "../../services/productService";

// Cache key for products
const CACHE_KEY = "admin_products_v1";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedBooks = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch (e) {}
  return null;
};

const setCachedBooks = (books) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: books,
      timestamp: Date.now()
    }));
  } catch (e) {}
};

export default function ManageBooks() {
  const [books, setBooks] = useState(() => getCachedBooks()?.items || []);
  const [loading, setLoading] = useState(!books.length);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBooks(!books.length);
  }, []);

  const fetchBooks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      
      const response = await getProducts(page);
      if (response && response.items) {
        setBooks(response.items);
        setTotalPages(response.pagination.totalPages);
        setError("");
        // Cache the successful response
        setCachedBooks(response);
      } else {
        setError("Không tìm thấy danh sách sách!");
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải danh sách sách");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá sách này không?")) {
      // Optimistically remove from UI
      const previousBooks = [...books];
      setBooks(books.filter(b => b.id_product !== id));
      
      try {
        await deleteProduct(id);
        // Remove from cache
        localStorage.removeItem(CACHE_KEY);
        // Refresh in background to ensure data consistency
        fetchBooks(false);
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xoá sách!");
        // Restore previous state on error
        setBooks(previousBooks);
      }
    }
  };

  return (
    <div className="book-container">
      <div className="book-header">
        <h2>
          Quản Lí Sách
          {refreshing && (
            <small style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
              (Đang cập nhật...)
            </small>
          )}
        </h2>
        <Link to="/admin/books/add" className="btn-add">
          + Thêm Sách
        </Link>
      </div>

      {loading ? (
        <div className="loading-box">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : (
        <div className="table-container">
          <table className="book-table">
            <thead>
              <tr>
                <th className="col-id">Mã</th>
                <th className="col-image">Ảnh</th>
                <th className="col-name">Tên sách</th>
                <th className="col-author">Tác giả</th>
                <th className="col-price">Giá</th>
                <th className="col-stock">Tồn kho</th>
                <th className="col-category">Thể loại</th>
                <th className="col-actions">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, index) => (
                <tr key={book.id_product}>
                  <td>{index + 1}</td>
                  <td>
                    <img 
                      src={book.image_product ? 
                        `http://localhost:3000${book.image_product}` : 
                        '/placeholder-book.jpg'} 
                      alt={book.name_product} 
                      className="book-img" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-book.jpg';
                      }}
                    />
                  </td>
                  <td>{book.name_product}</td>
                  <td>{book.author}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}</td>
                  <td>{book.quantity}</td>
                  <td>{book.category?.name_category || 'Chưa phân loại'}</td>
                  <td>
                    <Link
                      to={`/admin/books/edit/${book.id_product}`}
                      className="btn-edit"
                    >
                      Sửa
                    </Link>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(book.id_product)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
