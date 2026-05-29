export const mockCategories = [
  { id: 'phone', name: 'Điện thoại', icon: 'Smartphone' },
  { id: 'laptop', name: 'Laptop', icon: 'Laptop' },
  { id: 'tablet', name: 'Tablet', icon: 'Tablet' },
  { id: 'accessories', name: 'Phụ kiện', icon: 'Watch' }
]

export const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    category: 'phone',
    price: 34990000,
    originalPrice: 38990000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600',
    description: 'iPhone 15 Pro Max là dòng iPhone cao cấp nhất với chất liệu Titanium hàng không vũ trụ siêu bền, camera zoom 5x quang học đỉnh cao, hiệu năng quái vật từ chip A17 Pro.',
    specs: {
      screen: '6.7 inches, Super Retina XDR OLED, 120Hz',
      cpu: 'Apple A17 Pro 6 nhân',
      ram: '8 GB',
      storage: '256 GB',
      battery: '4441 mAh, Sạc nhanh 20W'
    },
    rating: 4.8,
    reviewsCount: 124,
    status: 'In Stock'
  },
  {
    id: 2,
    name: 'Macbook Air M3 8GB/256GB',
    category: 'laptop',
    price: 27990000,
    originalPrice: 29990000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600',
    description: 'Macbook Air M3 2024 mang đến sự kết hợp hoàn hảo giữa độ mỏng nhẹ tối đa và sức mạnh xử lý vượt trội nhờ chip Apple M3 tiên tiến, thời lượng pin đến 18 tiếng liên tục.',
    specs: {
      screen: '13.6 inches Liquid Retina, 2560x1664 pixels',
      cpu: 'Apple M3 8-core CPU',
      ram: '8 GB',
      storage: '256 GB SSD',
      battery: 'Thời lượng pin lên tới 18 giờ'
    },
    rating: 4.9,
    reviewsCount: 88,
    status: 'In Stock'
  },
  {
    id: 3,
    name: 'Samsung Galaxy S24 Ultra 5G',
    category: 'phone',
    price: 29990000,
    originalPrice: 33990000,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600',
    description: 'Samsung Galaxy S24 Ultra định nghĩa lại trải nghiệm smartphone với quyền năng Galaxy AI vượt trội, camera 200MP zoom không gian 100x và bút S-Pen đa năng tiện lợi.',
    specs: {
      screen: '6.8 inches, Dynamic AMOLED 2X, QHD+, 120Hz',
      cpu: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12 GB',
      storage: '256 GB',
      battery: '5000 mAh, Sạc nhanh 45W'
    },
    rating: 4.7,
    reviewsCount: 145,
    status: 'In Stock'
  },
  {
    id: 4,
    name: 'iPad Pro M4 11 inch 256GB Wifi',
    category: 'tablet',
    price: 28990000,
    originalPrice: 29990000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600',
    description: 'iPad Pro M4 siêu mỏng, hiệu năng vượt bậc với vi xử lý Apple M4 thế hệ mới, cùng màn hình Ultra Retina XDR sử dụng công nghệ OLED hai lớp tiên tiến nhất thế giới.',
    specs: {
      screen: '11 inches Ultra Retina XDR OLED, 120Hz',
      cpu: 'Apple M4 9-core CPU',
      ram: '8 GB',
      storage: '256 GB',
      battery: 'Pin sạc Li-Po công suất 31.29 Wh'
    },
    rating: 4.9,
    reviewsCount: 62,
    status: 'In Stock'
  },
  {
    id: 5,
    name: 'Apple Watch Series 9 GPS 41mm',
    category: 'accessories',
    price: 9490000,
    originalPrice: 10490000,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600',
    description: 'Apple Watch Series 9 sở hữu màn hình sáng vượt trội, tính năng Double Tap chạm hai lần để tương tác cực kỳ độc đáo và các cảm biến sức khoẻ tân tiến hàng đầu.',
    specs: {
      screen: 'OLED Retina luôn bật, 2000 nits',
      cpu: 'Apple S9 SiP',
      ram: 'Không công bố',
      storage: '64 GB',
      battery: 'Lên đến 18 giờ (36 giờ chế độ tiết kiệm)'
    },
    rating: 4.6,
    reviewsCount: 95,
    status: 'In Stock'
  },
  {
    id: 6,
    name: 'Tai nghe Bluetooth Apple AirPods Pro 2 USB-C',
    category: 'accessories',
    price: 5790000,
    originalPrice: 6190000,
    image: 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&q=80&w=600',
    description: 'AirPods Pro thế hệ thứ 2 mang lại khả năng chống ồn chủ động (ANC) tốt gấp hai lần phiên bản tiền nhiệm, cổng sạc Type-C hiện đại và chất âm vòm 3D hoàn mỹ.',
    specs: {
      screen: 'Không có',
      cpu: 'Apple H2 chip',
      ram: 'Không có',
      storage: 'Không có',
      battery: 'Lên đến 6 giờ nghe (30 giờ kèm hộp sạc)'
    },
    rating: 4.8,
    reviewsCount: 210,
    status: 'In Stock'
  }
]

export const mockOrders = [
  {
    id: 'ORD-1001',
    customerName: 'Nguyễn Văn A',
    email: 'nva@gmail.com',
    phone: '0987654321',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. HCM',
    total: 34990000,
    status: 'pending',
    paymentMethod: 'vnpay',
    paymentStatus: 'paid',
    createdAt: '2026-05-20T10:15:30Z',
    items: [
      { id: 1, name: 'iPhone 15 Pro Max 256GB', price: 34990000, quantity: 1 }
    ]
  },
  {
    id: 'ORD-1002',
    customerName: 'Trần Thị B',
    email: 'ttb@gmail.com',
    phone: '0912345678',
    address: '456 Đường Lê Lợi, Hải Châu, Đà Nẵng',
    total: 37480000,
    status: 'processing',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    createdAt: '2026-05-19T14:22:11Z',
    items: [
      { id: 5, name: 'Apple Watch Series 9 GPS 41mm', price: 9490000, quantity: 1 },
      { id: 2, name: 'Macbook Air M3 8GB/256GB', price: 27990000, quantity: 1 }
    ]
  }
]
