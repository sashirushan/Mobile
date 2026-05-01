const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');

// GET all promotions (Admin)
router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET verify promo code (Public)
router.get('/verify/:code', async (req, res) => {
  try {
    const promotion = await Promotion.findOne({ 
      promoCode: req.params.code.toUpperCase(), 
      isActive: true,
      type: 'Rental'
    });
    
    if (!promotion) {
      return res.status(404).json({ message: 'Invalid or expired promo code' });
    }
    
    res.json({
      success: true,
      discountPercentage: promotion.discountPercentage,
      title: promotion.title
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add new promotion (Admin)
router.post('/', async (req, res) => {
  try {
    const { title, description, type, discountPercentage, promoCode } = req.body;
    
    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (type === 'Rental') {
      if (!discountPercentage || !promoCode) {
        return res.status(400).json({ message: 'Rental promotions require a discount percentage and promo code' });
      }
      // Check if promo code already exists
      const existingPromo = await Promotion.findOne({ promoCode: promoCode.toUpperCase() });
      if (existingPromo) {
        return res.status(400).json({ message: 'Promo code already exists' });
      }
    }

    const newPromotion = new Promotion({
      title,
      description,
      type,
      discountPercentage: type === 'Rental' ? discountPercentage : 0,
      promoCode: type === 'Rental' ? promoCode.toUpperCase() : null
    });

    const savedPromotion = await newPromotion.save();
    res.status(201).json(savedPromotion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT toggle active status (Admin)
router.put('/:id/toggle', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    promotion.isActive = !promotion.isActive;
    const updatedPromotion = await promotion.save();
    res.json(updatedPromotion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT edit promotion (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, type, discountPercentage, promoCode } = req.body;
    
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    if (!title || !description || !type) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (type === 'Rental') {
      if (!discountPercentage || !promoCode) {
        return res.status(400).json({ message: 'Rental promotions require a discount percentage and promo code' });
      }
      // Check if promo code exists in ANOTHER promotion
      const existingPromo = await Promotion.findOne({ promoCode: promoCode.toUpperCase() });
      if (existingPromo && existingPromo._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Promo code already exists' });
      }
    }

    promotion.title = title;
    promotion.description = description;
    promotion.type = type;
    promotion.discountPercentage = type === 'Rental' ? discountPercentage : 0;
    promotion.promoCode = type === 'Rental' ? promoCode.toUpperCase() : null;

    const updatedPromotion = await promotion.save();
    res.json(updatedPromotion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE promotion (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    await promotion.deleteOne();
    res.json({ message: 'Promotion deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
