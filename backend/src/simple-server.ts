// Simple Express server as fallback
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockProducts = [
  {
    id: 1,
    name: 'Starter Website Package',
    description: 'Professional website with modern design, responsive layout, and basic SEO optimization.',
    price: 1999,
    status: 'active',
    category: 'web-development',
    image_url: 'https://via.placeholder.com/400x300?text=Website+Package',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 2,
    name: 'E-commerce Solution',
    description: 'Complete online store with payment processing, inventory management, and customer accounts.',
    price: 4999,
    status: 'active',
    category: 'e-commerce',
    image_url: 'https://via.placeholder.com/400x300?text=E-commerce+Solution',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 3,
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android with modern UI/UX design.',
    price: 7999,
    status: 'active',
    category: 'mobile-development',
    image_url: 'https://via.placeholder.com/400x300?text=Mobile+App',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 4,
    name: 'API Development Package',
    description: 'RESTful API development with authentication, documentation, and database integration.',
    price: 2999,
    status: 'active',
    category: 'backend-development',
    image_url: 'https://via.placeholder.com/400x300?text=API+Development',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 5,
    name: 'Cloud Infrastructure Setup',
    description: 'Complete cloud deployment with monitoring, backup, and security configuration.',
    price: 3499,
    status: 'active',
    category: 'devops',
    image_url: 'https://via.placeholder.com/400x300?text=Cloud+Infrastructure',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 6,
    name: 'Analytics Dashboard',
    description: 'Business intelligence dashboard with real-time data visualization and reporting.',
    price: 3999,
    status: 'active',
    category: 'data-analytics',
    image_url: 'https://via.placeholder.com/400x300?text=Analytics+Dashboard',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
];

// Routes
app.get('/api/products', (req, res) => {
  try {
    const activeProducts = mockProducts.filter(product => product.status === 'active');
    res.json(activeProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const product = mockProducts.find(p => p.id === productId && p.status === 'active');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

app.get('/api/products/category/:category', (req, res) => {
  try {
    const category = req.params.category;
    const products = mockProducts.filter(product => 
      product.category === category && product.status === 'active'
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products by category' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const newProduct = {
      id: mockProducts.length + 1,
      name: req.body.name || '',
      description: req.body.description || '',
      price: req.body.price || 0,
      status: 'active',
      category: req.body.category,
      image_url: req.body.image_url,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    mockProducts.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Quantis Technologies API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Quantis Technologies API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛍️ Products API: http://localhost:${PORT}/api/products`);
});

export default app;