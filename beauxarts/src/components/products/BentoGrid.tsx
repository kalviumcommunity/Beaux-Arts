import { Product } from '@/data/products';
import { ProductCard } from './ProductCard';

interface BentoGridProps {
  products: Product[];
}

export function BentoGrid({ products }: BentoGridProps) {
  // Define the bento layout pattern
  const getGridClass = (index: number): string => {
    const pattern = index % 6;
    switch (pattern) {
      case 0:
        return 'md:col-span-2 md:row-span-2';
      case 1:
        return 'md:col-span-1 md:row-span-1';
      case 2:
        return 'md:col-span-1 md:row-span-2';
      case 3:
        return 'md:col-span-1 md:row-span-1';
      case 4:
        return 'md:col-span-2 md:row-span-1';
      case 5:
        return 'md:col-span-1 md:row-span-1';
      default:
        return 'md:col-span-1 md:row-span-1';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(300px,auto)]">
      {products.map((product, index) => (
        <div key={product.id} className={getGridClass(index)}>
          <ProductCard product={product} index={index} variant="bento" />
        </div>
      ))}
    </div>
  );
}
