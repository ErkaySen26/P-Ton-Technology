# Next.js 14 ile Modern E-Ticaret Platformu Geliştirme: Sıfırdan Production'a Kapsamlı Rehber

_Gerçek dünya projesi üzerinden Next.js 14, TypeScript ve MongoDB kullanarak nasıl modern bir e-ticaret platformu geliştirebileceğinizi öğrenin._

## Giriş

E-ticaret platformları, modern web geliştirmenin en karmaşık ve öğretici projelerinden biridir. Bu yazıda, Next.js 14'ün en yeni özelliklerini kullanarak nasıl production-ready bir e-ticaret platformu geliştirebileceğinizi adım adım anlatacağım.

Bu proje boyunca karşılaştığım zorlukları, bulduğum çözümleri ve öğrendiğim dersleri sizlerle paylaşacağım. Amacım, teorik bilgiyi pratiğe dökmek isteyen geliştiricilere rehberlik etmek.

## Proje Genel Bakış

Bu projede geliştirdiğimiz platform şu temel özelliklere sahip:

### 🚀 **Temel Özellikler**

- **Kullanıcı Yönetimi**: NextAuth.js ile güvenli kimlik doğrulama
- **Ürün Yönetimi**: Dinamik ürün ekleme, düzenleme ve silme
- **Yorum Sistemi**: Gerçek zamanlı ürün yorumları ve puanlama
- **Admin Dashboard**: Kapsamlı yönetim paneli
- **Sepet Yönetimi**: Tam fonksiyonel alışveriş sepeti
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm

### 🛠️ **Kullanılan Teknolojiler**

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Veritabanı**: MongoDB Atlas
- **Kimlik Doğrulama**: NextAuth.js
- **UI Kütüphanesi**: Material-UI
- **State Management**: React Context API

## Teknik Mimari

### Frontend Mimarisi

Next.js 14'ün App Router yapısını kullanarak modern bir React uygulaması geliştirdik:

```typescript
// app/layout.tsx - Ana layout komponenti
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import CartProvider from "@/provider/CartProvider";
import AuthProvider from "@/provider/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Burada.com - En İyi Teknoloji Ürünleri",
  description:
    "En yeni teknoloji ürünleri, en uygun fiyatlarla. Güvenli alışveriş, hızlı teslimat ve ücretsiz kargo fırsatları.",
  keywords: "e-ticaret, teknoloji, elektronik, telefon, bilgisayar",
  authors: [{ name: "Burada.com" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Backend ve Veritabanı

MongoDB Atlas ve Prisma ORM kombinasyonu kullanarak esnek ve güçlü bir backend yapısı oluşturduk:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String
  price       Float
  brand       String
  category    String
  inStock     Boolean
  image       String
  reviews     Review[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Review {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  productId   String   @db.ObjectId
  rating      Int
  comment     String
  createdDate DateTime @default(now())

  product Product @relation(fields: [productId], references: [id])
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id             String    @id @default(auto()) @map("_id") @db.ObjectId
  name           String?
  email          String?   @unique
  emailVerified  DateTime?
  image          String?
  hashedPassword String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  role           Role      @default(USER)

  accounts Account[]
  reviews  Review[]
}

enum Role {
  USER
  ADMIN
}
```

## Öne Çıkan Teknik Çözümler

### 1. Server Components ve Client Components Optimizasyonu

Next.js 14'ün Server Components özelliğini kullanarak performans optimizasyonu sağladık:

```typescript
// app/components/home/Products.tsx - Server Component
interface ProductsProps {
  searchParams?: {
    search?: string;
    category?: string;
  };
}

const Products = async ({ searchParams }: ProductsProps) => {
  // Veritabanından ürünleri getir
  const products = await getProducts(searchParams as IProductParams);

  if (products.length === 0) {
    const message = searchParams?.search
      ? `"${searchParams.search}" için ürün bulunamadı`
      : "Ürün Bulunmamakta";
    return (
      <div className="flex items-center justify-center py-20">
        <WarningText text={message} />
      </div>
    );
  }

  const headingText = searchParams?.search
    ? `"${searchParams.search}" için sonuçlar (${products.length})`
    : searchParams?.category
    ? `${searchParams.category} Kategorisi (${products.length})`
    : `Tüm Ürünler (${products.length})`;

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading text={headingText} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {products.map((product: any) => (
            <div key={product.id} className="flex justify-center">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
```

### 2. API Routes ile RESTful Backend

Next.js API Routes kullanarak tam RESTful API geliştirdik:

```typescript
// app/api/reviews/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/getCurrentUser";
import prisma from "@/libs/prismadb";

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { comment, rating } = body;
    const { productId } = params;

    if (!comment || !rating || !productId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: currentUser.id,
        productId: productId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        comment,
        rating,
        userId: currentUser.id,
        productId: productId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdDate: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 3. TypeScript ile Type Safety

Tüm projede güçlü tip kontrolü sağladık:

```typescript
// types/index.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  inStock: boolean;
  image: string;
  reviews: Review[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  productId: string;
  createdDate: Date;
  user: {
    name: string;
    image?: string;
  };
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
}

export interface CommentProps {
  prd: Review;
}

export interface AddReviewProps {
  productId: string;
  onReviewAdded: () => void;
}
```

### 4. Modern Yorum Sistemi

Dinamik yorum ekleme ve görüntüleme sistemi:

```typescript
// app/components/detail/AddReview.tsx
"use client";

import { useState } from "react";
import { Rating } from "@mui/material";
import Button from "../general/Button";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface AddReviewProps {
  productId: string;
  onReviewAdded: () => void;
}

const AddReview = ({ productId, onReviewAdded }: AddReviewProps) => {
  const { data: session } = useSession();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Yorum yapmak için giriş yapmalısınız");
      return;
    }

    if (rating === 0) {
      toast.error("Lütfen bir puan verin");
      return;
    }

    if (!comment.trim()) {
      toast.error("Lütfen yorum yazın");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/reviews/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Yorum eklenirken hata oluştu");
      }

      toast.success("Yorumunuz başarıyla eklendi!");
      setRating(0);
      setComment("");
      onReviewAdded();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600">Yorum yapmak için giriş yapmalısınız.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Ürün Yorumu Ekle</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puanınız
          </label>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue || 0);
            }}
            size="large"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yorumunuz
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length}/500 karakter
          </p>
        </div>

        <Button
          text={loading ? "Gönderiliyor..." : "Yorum Gönder"}
          onClick={() => {}}
          disabled={loading}
          small={false}
        />
      </form>
    </div>
  );
};

export default AddReview;
```

## Karşılaştığım Zorluklar ve Çözümler

### 1. Image Optimizasyonu Sorunu

**Problem**: Next.js Image component'i ile external URL'lerde yaşanan güvenlik sorunları

**Çözüm**: next.config.js yapılandırması ile güvenli hostname'leri tanımladık:

```javascript
// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
```

### 2. Dynamic Routing ve SEO

**Problem**: App Router'da dynamic route'ların static generation'ı

**Çözüm**:

```typescript
// app/product/[productId]/page.tsx
import { notFound } from "next/navigation";
import DetailClient from "@/app/components/detail/DetailClient";
import getProductsId from "@/app/actions/getProductsId";

type DetailProps = {
  productId?: string;
};

const ProductDetail = async ({ params }: { params: DetailProps }) => {
  const { productId } = params;
  const product = await getProductsId({ productId });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <DetailClient product={product} />
    </div>
  );
};

export default ProductDetail;

// Metadata için
export async function generateMetadata({ params }: { params: DetailProps }) {
  const { productId } = params;
  const product = await getProductsId({ productId });

  if (!product) {
    return {
      title: "Ürün Bulunamadı",
    };
  }

  return {
    title: `${product.name} - Burada.com`,
    description: product.description,
  };
}
```

### 3. State Management Optimizasyonu

**Problem**: Global state yönetimi ve performance

**Çözüm**: React Context API ile optimize edilmiş state management:

```typescript
// provider/CartProvider.tsx
"use client";

import { CardProductProps } from "@/app/components/detail/DetailClient";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

interface CartContextProps {
  cartPrdcts: CardProductProps[] | null;
  cartTotalQty: number;
  cartTotalAmount: number;
  addToBasket: (product: CardProductProps) => void;
  addToBasketIncrease: (product: CardProductProps) => void;
  addToBasketDecrease: (product: CardProductProps) => void;
  removeFromCart: (product: CardProductProps) => void;
  removeCart: () => void;
}

const CartContext = createContext<CartContextProps | null>(null);

interface Props {
  [propName: string]: any;
}

export const CartContextProvider = (props: Props) => {
  const [cartPrdcts, setCartPrdcts] = useState<CardProductProps[] | null>(null);
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartTotalAmount, setCartTotalAmount] = useState(0);

  useEffect(() => {
    const getItem: any = localStorage.getItem("cart");
    const getItemParse: CardProductProps[] | null = JSON.parse(getItem);
    setCartPrdcts(getItemParse);
  }, []);

  useEffect(() => {
    const getTotalQty = () => {
      if (cartPrdcts) {
        const { totalQty, totalAmount } = cartPrdcts?.reduce(
          (acc, item) => {
            const itemTotal = item.price * item.quantity;
            acc.totalQty += item.quantity;
            acc.totalAmount += itemTotal;
            return acc;
          },
          {
            totalQty: 0,
            totalAmount: 0,
          }
        );
        setCartTotalQty(totalQty);
        setCartTotalAmount(totalAmount);
      }
    };
    getTotalQty();
  }, [cartPrdcts]);

  const addToBasket = useCallback((product: CardProductProps) => {
    setCartPrdcts((prev) => {
      let updatedCart;
      if (prev) {
        updatedCart = [...prev, product];
      } else {
        updatedCart = [product];
      }
      toast.success("Ürün sepete eklendi");
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  }, []);

  const removeFromCart = useCallback(
    (product: CardProductProps) => {
      if (cartPrdcts) {
        const filteredProducts = cartPrdcts.filter(
          (cart) => cart.id !== product.id
        );
        setCartPrdcts(filteredProducts);
        toast.success("Ürün sepetten kaldırıldı");
        localStorage.setItem("cart", JSON.stringify(filteredProducts));
      }
    },
    [cartPrdcts]
  );

  const addToBasketIncrease = useCallback(
    (product: CardProductProps) => {
      let updatedCart;
      if (product.quantity === 10) {
        return toast.error("Maksimum limit 10");
      }
      if (cartPrdcts) {
        updatedCart = [...cartPrdcts];
        const existingIndex = cartPrdcts.findIndex(
          (item) => item.id === product.id
        );
        if (existingIndex > -1) {
          updatedCart[existingIndex].quantity = ++updatedCart[existingIndex]
            .quantity;
        }
        setCartPrdcts(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
    },
    [cartPrdcts]
  );

  const addToBasketDecrease = useCallback(
    (product: CardProductProps) => {
      let updatedCart;
      if (product.quantity === 1) {
        return toast.error("Minimum limit 1");
      }
      if (cartPrdcts) {
        updatedCart = [...cartPrdcts];
        const existingIndex = cartPrdcts.findIndex(
          (item) => item.id === product.id
        );
        if (existingIndex > -1) {
          updatedCart[existingIndex].quantity = --updatedCart[existingIndex]
            .quantity;
        }
        setCartPrdcts(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
    },
    [cartPrdcts]
  );

  const removeCart = useCallback(() => {
    setCartPrdcts(null);
    setCartTotalQty(0);
    localStorage.setItem("cart", JSON.stringify(null));
    toast.success("Sepet temizlendi");
  }, []);

  const value = {
    cartPrdcts,
    cartTotalQty,
    cartTotalAmount,
    addToBasket,
    addToBasketIncrease,
    addToBasketDecrease,
    removeFromCart,
    removeCart,
  };

  return <CartContext.Provider value={value} {...props} />;
};

const useCart = () => {
  const context = useContext(CartContext);
  if (context == null) {
    throw new Error("useCart must be used within a CartContextProvider");
  }
  return context;
};

export default useCart;
```

### 4. Database Query Optimization

**Problem**: Performans için veritabanı sorgularının optimizasyonu

**Çözüm**: Prisma ile optimize edilmiş queries:

```typescript
// app/actions/getProducts.ts
import prisma from "@/libs/prismadb";

export interface IProductParams {
  category?: string | null;
  search?: string | null;
}

export default async function getProducts(params: IProductParams) {
  try {
    const { category, search } = params;
    let searchString = search;
    if (!search) {
      searchString = "";
    }
    let query: any = {};

    if (category) {
      query.category = category;
    }

    const products = await prisma.product.findMany({
      where: {
        ...query,
        ...(searchString && {
          OR: [
            {
              name: {
                contains: searchString,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchString,
                mode: "insensitive",
              },
            },
            {
              brand: {
                contains: searchString,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      include: {
        reviews: {
          include: {
            user: true,
          },
          orderBy: {
            createdDate: "desc",
          },
        },
      },
    });

    return products;
  } catch (error: any) {
    throw new Error(error);
  }
}
```

## Performance Optimizasyonları

### 1. Code Splitting ve Lazy Loading

```typescript
// Dynamic imports for better performance
import dynamic from "next/dynamic";

const AdminDashboard = dynamic(
  () => import("@/app/components/admin/AdminDashboard"),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);
```

### 2. Image Optimization

```typescript
// Optimized Image component usage
import Image from "next/image";

const ProductCard = ({ product }: { product: any }) => {
  return (
    <div className="relative h-[200px] bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Image
        src={product.image}
        fill
        alt={product.name}
        className="object-contain group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        priority={false}
      />
    </div>
  );
};
```

### 3. Caching Strategies

```typescript
// API Route with caching
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        reviews: true,
      },
    });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

## Deployment ve Production

### 1. Build Optimizasyonu

Production deployment için şu adımları uyguladık:

```bash
# Build komutu
npm run build

# Production server başlatma
npm run start

# Build analizi
npm run analyze
```

### 2. Environment Variables

```env
# Production .env örneği
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/ecommerce"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Error Handling ve Logging

```typescript
// Global error boundary
// app/error.tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
```

### 4. Security Best Practices

```typescript
// Middleware for route protection
// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Admin routes protection
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
```

## UI/UX Design Patterns

### 1. Responsive Design

```css
/* Tailwind CSS ile responsive tasarım */
.product-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.card-hover-effect {
  @apply transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl;
}
```

### 2. Loading States

```typescript
// Loading component
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
};
```

### 3. Error States

```typescript
// Error display component
const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
};
```

## Testing Strategies

### 1. Unit Testing

```typescript
// __tests__/utils/textClip.test.ts
import textClip from "@/utils/TextClip";

describe("textClip", () => {
  it("should clip text to specified length", () => {
    const longText = "This is a very long text that should be clipped";
    const result = textClip(longText, 20);
    expect(result).toBe("This is a very long...");
  });

  it("should return original text if shorter than limit", () => {
    const shortText = "Short text";
    const result = textClip(shortText, 20);
    expect(result).toBe("Short text");
  });
});
```

### 2. Integration Testing

```typescript
// __tests__/api/products.test.ts
import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/products";

describe("/api/products", () => {
  it("should return products list", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });
});
```

## Sonuç ve Öğrendiklerim

Bu proje boyunca edindiğim temel deneyimler:

### 🎯 **Teknik Beceriler**

- **Next.js 14**: App Router, Server Components, API Routes
- **TypeScript**: Type safety ve better developer experience
- **Database Design**: MongoDB ile NoSQL tasarım patterns
- **Authentication**: NextAuth.js ile secure authentication
- **State Management**: Context API ile optimized state handling
- **Performance**: Image optimization, code splitting, caching

### 💡 **Soft Skills**

- **Problem Solving**: Karmaşık technical challengeları çözme
- **Project Planning**: Feature requirements'tan implementation'a
- **User Experience**: End-user perspektifiyle thinking
- **Code Quality**: Clean code, maintainability, documentation

### 🚀 **Best Practices**

- **Security First**: Authentication, authorization, data validation
- **Performance Optimization**: Lazy loading, caching, image optimization
- **Responsive Design**: Mobile-first approach
- **Error Handling**: Graceful error handling ve user feedback
- **SEO Optimization**: Meta tags, structured data, semantic HTML

## Gelecek Planları

Projeyi daha da geliştirmek için planladığım özellikler:

### 🔮 **Teknik Geliştirmeler**

- **Real-time Features**: WebSocket ile live notifications
- **Advanced Search**: Elasticsearch integration
- **Payment Integration**: Stripe/PayPal integration
- **PWA Support**: Offline capabilities ve app-like experience
- **Microservices**: Service-oriented architecture

### 📊 **Analytics ve Monitoring**

- **Performance Monitoring**: Web Vitals tracking
- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics 4 implementation
- **A/B Testing**: Feature flag management

### 🎨 **UI/UX Improvements**

- **Design System**: Component library creation
- **Accessibility**: WCAG compliance
- **Internationalization**: Multi-language support
- **Dark Mode**: Theme switching capability

## Kaynaklar ve Referanslar

Bu projede kullandığım kaynaklar:

### 📚 **Dokümantasyon**

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 🛠️ **Tools ve Libraries**

- [TypeScript](https://www.typescriptlang.org)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Material-UI](https://mui.com)
- [React Hook Form](https://react-hook-form.com)

### 📖 **Öğrenme Kaynakları**

- Next.js official tutorials
- TypeScript handbook
- MongoDB University courses
- React patterns ve best practices

---

Bu makale, gerçek bir proje deneyimi üzerine yazılmıştır. E-ticaret platformu geliştirme sürecinde karşılaştığım tüm zorlukları, bulduğum çözümleri ve öğrendiğim dersleri sizlerle paylaştım.

Modern web development'ta teorik bilgiyi pratiğe dökmek için bu tür kapsamlı projeler yapmak çok önemli. Her developer'ın böyle bir "learning project"e sahip olması gerektiğine inanıyorum.

Sorularınız veya projede geliştirmek istediğiniz alanlar varsa yorumlarda belirtebilirsiniz. Ayrıca GitHub repository'sini inceleyerek kodları detaylı olarak görebilirsiniz.

Happy coding! 🚀

---

**Etiketler:** #NextJS #TypeScript #MongoDB #WebDevelopment #FullStack #React #ECommerce #JavaScript #WebDev #TechBlog #Programming #SoftwareDevelopment #ModernWeb #Frontend #Backend

**Proje Repository:** [GitHub - Nextjs-Ecommerce-Project](https://github.com/ErkaySen26/Nextjs-Ecommerce-Project)

---

_Bu makale, pratik deneyim ve öğrenme odaklı yazılmıştır. Geliştiricilerin gerçek dünya projelerinde karşılaşabileceği durumları ve çözümleri kapsamaktadır._
