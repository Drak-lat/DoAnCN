const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3000;
const API_PATH = '/api/admin';
const TOKEN = 'your-token-here'; // Thay thế bằng token thực tế

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: API_PATH + path,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${method} ${path} - Status: ${res.statusCode}`);
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test data
const testProduct = {
  name_product: "Sách Test",
  price: 100000,
  quantity: 10,
  author: "Tác giả Test",
  publisher: "NXB Test",
  id_category: 1
};

// Test all endpoints
async function testEndpoints() {
  try {
    // 1. GET /products - Lấy danh sách
    console.log('\n1. Testing GET /products');
    const listResponse = await makeRequest('GET', '/products');
    console.log('Status:', listResponse.status);
    console.log('Data:', JSON.stringify(listResponse.data, null, 2));

    // 2. POST /products - Tạo mới
    console.log('\n2. Testing POST /products');
    const createResponse = await makeRequest('POST', '/products', testProduct);
    console.log('Status:', createResponse.status);
    console.log('Data:', JSON.stringify(createResponse.data, null, 2));

    const newProductId = createResponse.data.data.id_product;

    // 3. GET /products/:id - Xem chi tiết
    console.log(`\n3. Testing GET /products/${newProductId}`);
    const getOneResponse = await makeRequest('GET', `/products/${newProductId}`);
    console.log('Status:', getOneResponse.status);
    console.log('Data:', JSON.stringify(getOneResponse.data, null, 2));

    // 4. PUT /products/:id - Cập nhật
    console.log(`\n4. Testing PUT /products/${newProductId}`);
    const updateResponse = await makeRequest('PUT', `/products/${newProductId}`, {
      ...testProduct,
      name_product: "Sách Test (Đã cập nhật)"
    });
    console.log('Status:', updateResponse.status);
    console.log('Data:', JSON.stringify(updateResponse.data, null, 2));

    // 5. DELETE /products/:id - Xóa
    console.log(`\n5. Testing DELETE /products/${newProductId}`);
    const deleteResponse = await makeRequest('DELETE', `/products/${newProductId}`);
    console.log('Status:', deleteResponse.status);
    console.log('Data:', JSON.stringify(deleteResponse.data, null, 2));

  } catch (error) {
    console.error('Error:', {
      endpoint: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data || error.message
    });
  }
}

testEndpoints();