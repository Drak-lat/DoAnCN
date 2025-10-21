const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true })); // Thêm dòng này
app.use(express.json());

// Simple request logger to help debugging (method, url, body)
app.use((req, res, next) => {
	try {
		console.log(`[REQ] ${req.method} ${req.originalUrl} -- body:`, JSON.stringify(req.body));
	} catch (e) {
		console.log(`[REQ] ${req.method} ${req.originalUrl} -- (body not serializable)`);
	}
	next();
});

// Khai báo các route ở đây:
const customerRoutes = require('./routes/customer.routes');
app.use('/api/customer', customerRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// If frontend build exists, serve it (allows BrowserRouter direct links)
const path = require('path');
const frontendBuild = path.join(__dirname, '..', '..', '02.Web', 'build');
const fs = require('fs');
if (fs.existsSync(frontendBuild)) {
	app.use(express.static(frontendBuild));
	app.get('*', (req, res) => {
		res.sendFile(path.join(frontendBuild, 'index.html'));
	});
}

module.exports = app;