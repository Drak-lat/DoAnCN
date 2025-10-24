exports.echo = async (req, res) => {
  try {
    const body = req.body || {};
    const file = req.file || null;
    res.json({
      success: true,
      headers: req.headers,
      body,
      file: file ? { originalname: file.originalname, filename: file.filename, size: file.size } : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
