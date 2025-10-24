import api from "./api";

// Get all products with optional pagination
export const getProducts = async (page = 1, limit = 100) => {
  const response = await api.get("/admin/products", {
    params: { page, limit }
  });
  return response.data;
};

// Get a specific product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/admin/products/${id}`);
  return response.data;
};

// Create a new product
export const createProduct = async (formData) => {
  const response = await api.post("/admin/products", formData);
  return response.data;
};

// Update an existing product
export const updateProduct = async (id, formData) => {
  const response = await api.put(`/admin/products/${id}`, formData);
  return response.data;
};

// Delete a product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};
