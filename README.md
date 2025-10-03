# Next.js 14 ile Modern E-Ticaret Platformu Geliştirme

*Next.js 14, TypeScript ve MongoDB kullanarak modern bir e-ticaret platformu geliştirme rehberi.*

## Proje Genel Bakış

Bu projede geliştirdiğimiz platform:

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
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/navbar/Navbar'
import Footer from './components/footer/Footer'
import CartProvider from '@/provider/CartProvider'
import AuthProvider from '@/provider/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Burada.com - En İyi Teknoloji Ürünleri',
  description: 'En yeni teknoloji ürünleri, en uygun fiyatlarla.',
  keywords: 'e-ticaret, teknoloji, elektronik, telefon, bilgisayar',
  authors: [{ name: 'Burada.com' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
  )
}
```

### Backend ve Veritabanı

MongoDB Atlas ve Prisma ORM kombinasyonu:

```prisma
// prisma/schema.prisma
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

### 1. Server Components ve API Routes

```typescript
// app/components/home/Products.tsx - Server Component
const Products = async ({ searchParams }: ProductsProps) => {
  const products = await getProducts(searchParams as IProductParams);

  if (products.length === 0) {
    return <WarningText text="Ürün Bulunmamakta" />;
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 2. RESTful API ile Yorum Sistemi

```typescript
// app/api/reviews/[productId]/route.ts
export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { comment, rating } = body
    const { productId } = params

    // Validation
    if (!comment || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        comment,
        rating,
        userId: currentUser.id,
        productId: productId
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

### 3. TypeScript ile Type Safety

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
```

## Karşılaştığım Zorluklar ve Çözümler

### 1. Image Optimizasyonu

**Problem**: Next.js Image component ile external URL güvenlik sorunları

**Çözüm**: next.config.js yapılandırması:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  }
}
```

### 2. State Management

React Context API ile optimize edilmiş sepet yönetimi:

```typescript
// provider/CartProvider.tsx
export const CartContextProvider = (props: Props) => {
  const [cartPrdcts, setCartPrdcts] = useState<CardProductProps[] | null>(null)
  const [cartTotalQty, setCartTotalQty] = useState(0)
  const [cartTotalAmount, setCartTotalAmount] = useState(0)

  const addToBasket = useCallback((product: CardProductProps) => {
    setCartPrdcts(prev => {
      const updatedCart = prev ? [...prev, product] : [product]
      toast.success('Ürün sepete eklendi')
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      return updatedCart
    })
  }, [])

  // ... diğer sepet fonksiyonları
}
```

## Performance Optimizasyonları

### 1. Code Splitting

```typescript
import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(() => import('@/app/components/admin/AdminDashboard'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})
```

### 2. Database Query Optimization

```typescript
const products = await prisma.product.findMany({
  where: {
    ...query,
    ...(searchString && {
      OR: [
        { name: { contains: searchString, mode: 'insensitive' } },
        { description: { contains: searchString, mode: 'insensitive' } },
        { brand: { contains: searchString, mode: 'insensitive' } }
      ]
    })
  },
  include: {
    reviews: {
      include: { user: true },
      orderBy: { createdDate: "desc" }
    }
  }
})
```

## Deployment ve Production

### Build ve Deployment

```bash
npm run build
npm run start
```

### Environment Variables

```env
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Öğrendiklerim

### 🎯 **Teknik Beceriler**
- Next.js 14 App Router ve Server Components
- TypeScript ile type safety
- MongoDB ve Prisma ORM
- NextAuth.js authentication
- Performance optimization

### 🚀 **Best Practices**
- Security first approach
- Responsive design
- Error handling
- SEO optimization
- Code splitting

## Gelecek Planları

- **Real-time Features**: WebSocket entegrasyonu
- **Payment Integration**: Stripe/PayPal
- **PWA Support**: Offline capabilities
- **Analytics**: Performance monitoring

---

Bu makale, gerçek bir e-ticaret projesi deneyimi üzerine yazılmıştır. Modern web development tekniklerini pratiğe dökmek isteyen geliştiriciler için rehber niteliğindedir.

**Proje Repository:** [GitHub - Nextjs-Ecommerce-Project](https://github.com/ErkaySen26/Nextjs-Ecommerce-Project)

**Etiketler:** #NextJS #TypeScript #MongoDB #ECommerce #FullStack #React

---

*Bu makale, pratik deneyim ve öğrenme odaklı yazılmıştır.*
