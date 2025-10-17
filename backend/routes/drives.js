import express from 'express';

const router = express.Router();

// Placeholder drive routes
router.get('/', (req, res) => {
  res.json({ message: 'Drive routes placeholder' });
});

export default router;