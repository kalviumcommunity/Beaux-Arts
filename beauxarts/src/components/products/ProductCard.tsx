import  Link from "next/link";
import { motion } from "motion/react"
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'featured' | 'bento';
}

export function ProductCard({ product, index = 0, variant = 'default' }: ProductCardProps) {
  const isBento = variant === 'bento';
  const isFeatured = variant === 'featured';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/product/${product.id}`}
        className={`group block ${isBento ? 'h-full' : ''}`}
      >
        <div className={`relative overflow-hidden bg-secondary ${
          isBento ? 'aspect-auto h-full min-h-[280px]' : 
          isFeatured ? 'aspect-[4/5]' : 'aspect-[3/4]'
        }`}>
          <img
            src={product.image}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
        </div>

        <div className={`mt-4 ${isBento ? 'px-4 pb-4' : ''}`}>
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-display text-base md:text-lg leading-tight">{product.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{product.artist}</p>
            </div>
            <p className="font-body text-sm">${product.price.toLocaleString()}</p>
          </div>
          {isFeatured && (
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
              {product.category}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
