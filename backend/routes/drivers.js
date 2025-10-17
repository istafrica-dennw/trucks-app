import express from 'express';

const router = express.Router();

// Placeholder driver routes
router.get('/', (req, res) => {
  res.json({ message: 'Driver routes placeholder' });
});

export default router;