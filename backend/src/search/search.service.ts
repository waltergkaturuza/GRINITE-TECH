import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly servicesService: ServicesService,
  ) {}

  async search(query: string) {
    const q = (query || '').trim();

    const [products, services] = await Promise.all([
      q ? this.productsService.searchProducts(q) : this.productsService.getActiveProducts(),
      this.servicesService.findAll(undefined, 'active'),
    ]);

    // Basic fuzzy filter on in-memory services list
    const lower = q.toLowerCase();
    const filteredServices = q
      ? services.filter(
          (s) =>
            s.title.toLowerCase().includes(lower) ||
            s.description.toLowerCase().includes(lower) ||
            s.category.toLowerCase().includes(lower),
        )
      : services;

    const actions = [
      { label: 'Contact sales', path: '/contact', keywords: ['contact', 'help', 'support', 'sales'] },
      { label: 'View services', path: '/services', keywords: ['services', 'offerings'] },
      { label: 'View products', path: '/products', keywords: ['products', 'store'] },
      { label: 'Track request', path: '/track-request', keywords: ['track', 'status', 'request'] },
      { label: 'Login', path: '/login', keywords: ['login', 'signin', 'admin'] },
    ];

    const filteredActions = q
      ? actions.filter((a) => {
          const l = lower;
          return (
            a.label.toLowerCase().includes(l) ||
            a.keywords.some((k) => k.toLowerCase().includes(l))
          );
        })
      : actions;

    return {
      query: q,
      products,
      services: filteredServices,
      actions: filteredActions,
    };
  }
}

