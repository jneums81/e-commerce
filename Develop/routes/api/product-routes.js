const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// GET all products with associated Category and Tag data
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag },
      ],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET one product by its `id` with associated Category and Tag data
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag },
      ],
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create a new product
router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT update a product by its `id`
router.put('/:id', async (req, res) => {
  try {
    const [rowsUpdated] = await Product.update(req.body, {
      where: { id: req.params.id },
    });

    if (rowsUpdated === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (req.body.tagIds) {
      await ProductTag.destroy({ where: { product_id: req.params.id } });
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json({ message: 'Product updated' });
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a product by its `id`
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({
      where: { id: req.params.id },
    });

    if (deletedProduct === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
