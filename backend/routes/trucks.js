import express from 'express';

const router = express.Router();

// Placeholder truck routes
router.get('/', (req, res) => {
  res.json({ message: 'Truck routes placeholder' });
});

export default router;