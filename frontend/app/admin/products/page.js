"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";
import { useToast } from "@/components/Providers";
import AdminHead from "@/components/AdminHead";
import { Loading, Modal, Pager, ProductImage, useLoad } from "@/components/ui";

// HƠN 35+ MẪU ĐIỆN THOẠI MỚI NHẤT NĂM NAY ĐỂ ADMIN THÊM NHANH TRONG 1 CLICK
const QUICK_PRESETS = [
  // ===== APPLE IPHONE (2025 - 2026) =====
  {
    name: "iPhone 16 Pro Max 1TB",
    brandName: "Apple",
    categoryName: "Flagship",
    price: 46990000,
    salePrice: 44490000,
    stock: 20,
    screen: "6.9\" Super Retina XDR OLED 120Hz ProMotion",
    chip: "Apple A18 Pro 3nm",
    ram: "8GB",
    storage: "1TB",
    camera: "48MP Fusion + 48MP Ultra Wide + 12MP Tele 5x",
    battery: "4685 mAh",
    color: "Titan Sa Mạc",
    imageUrl: "/products/iphone-16-pro-max.png",
    description: "iPhone 16 Pro Max 1TB dung lượng tối đa, nút điều khiển Camera Control, viền titan sang trọng.",
  },
  {
    name: "iPhone 16 Pro Max 512GB",
    brandName: "Apple",
    categoryName: "Flagship",
    price: 40990000,
    salePrice: 38490000,
    stock: 35,
    screen: "6.9\" Super Retina XDR OLED 120Hz ProMotion",
    chip: "Apple A18 Pro 3nm",
    ram: "8GB",
    storage: "512GB",
    camera: "48MP + 48MP + 12MP",
    battery: "4685 mAh",
    color: "Titan Tự Nhiên",
    imageUrl: "/products/iphone-16-pro-max.png",
    description: "iPhone 16 Pro Max 512GB hàng chính hãng VN/A, hỗ trợ Apple Intelligence toàn diện.",
  },
  {
    name: "iPhone 16 Pro Max 256GB",
    brandName: "Apple",
    categoryName: "Flagship",
    price: 34990000,
    salePrice: 32490000,
    stock: 50,
    screen: "6.9\" Super Retina XDR OLED 120Hz ProMotion",
    chip: "Apple A18 Pro 3nm",
    ram: "8GB",
    storage: "256GB",
    camera: "48MP + 48MP + 12MP",
    battery: "4685 mAh",
    color: "Titan Sa Mạc",
    imageUrl: "/products/iphone-16-pro-max.png",
    description: "iPhone 16 Pro Max bản bán chạy nhất, màn hình 6.9 inch cực đại, pin trâu nhất lịch sử iPhone.",
  },
  {
    name: "iPhone 16 Pro 256GB",
    brandName: "Apple",
    categoryName: "Flagship",
    price: 31990000,
    salePrice: 29490000,
    stock: 30,
    screen: "6.3\" Super Retina XDR OLED 120Hz",
    chip: "Apple A18 Pro 3nm",
    ram: "8GB",
    storage: "256GB",
    camera: "48MP + 48MP + 12MP",
    battery: "3582 mAh",
    color: "Titan Đen",
    imageUrl: "/products/iphone-16-pro-max.png",
    description: "iPhone 16 Pro nhỏ gọn mạnh mẽ, camera tiềm vọng 5x, thời lượng pin nâng cấp vượt bậc.",
  },
  {
    name: "iPhone 16 Pro 128GB",
    brandName: "Apple",
    categoryName: "Flagship",
    price: 28990000,
    salePrice: 26990000,
    stock: 40,
    screen: "6.3\" Super Retina XDR OLED 120Hz",
    chip: "Apple A18 Pro 3nm",
    ram: "8GB",
    storage: "128GB",
    camera: "48MP + 48MP + 12MP",
    battery: "3582 mAh",
    color: "Titan Trắng",
    imageUrl: "/products/iphone-16-pro-max.png",
    description: "iPhone 16 Pro 128GB tiêu chuẩn cao cấp, hỗ trợ quay video 4K 120fps Dolby Vision.",
  },
  {
    name: "iPhone 16 Plus 128GB",
    brandName: "Apple",
    categoryName: "Flagship",
    price: 25990000,
    salePrice: 23990000,
    stock: 25,
    screen: "6.7\" Super Retina XDR OLED",
    chip: "Apple A18",
    ram: "8GB",
    storage: "128GB",
    camera: "48MP + 12MP",
    battery: "4674 mAh",
    color: "Xanh Lưu Ly",
    imageUrl: "/products/iphone-16.png",
    description: "iPhone 16 Plus màn hình 6.7 inch to đã mắt, pin siêu khủng dùng thoải mái 2 ngày.",
  },
  {
    name: "iPhone 16 128GB",
    brandName: "Apple",
    categoryName: "Flagship",
    price: 22990000,
    salePrice: 20990000,
    stock: 45,
    screen: "6.1\" Super Retina XDR OLED",
    chip: "Apple A18",
    ram: "8GB",
    storage: "128GB",
    camera: "48MP + 12MP",
    battery: "3561 mAh",
    color: "Xanh Mòng Két",
    imageUrl: "/products/iphone-16.png",
    description: "iPhone 16 thiết kế camera dọc mới lạ, nút Action và nút Camera Control thế hệ mới.",
  },
  {
    name: "iPhone 15 Pro Max 256GB",
    brandName: "Apple",
    categoryName: "Flagship",
    price: 29990000,
    salePrice: 28490000,
    stock: 30,
    screen: "6.7\" Super Retina XDR 120Hz",
    chip: "Apple A17 Pro",
    ram: "8GB",
    storage: "256GB",
    camera: "48MP + 12MP + 12MP",
    battery: "4422 mAh",
    color: "Titan Tự Nhiên",
    imageUrl: "/products/iphone-16-pro-max.png",
    description: "iPhone 15 Pro Max khung titan cao cấp, chip A17 Pro chơi game đồ họa đỉnh cao.",
  },
  {
    name: "iPhone 15 128GB",
    brandName: "Apple",
    categoryName: "Flagship",
    price: 19990000,
    salePrice: 18290000,
    stock: 40,
    screen: "6.1\" Super Retina XDR OLED",
    chip: "Apple A16 Bionic",
    ram: "6GB",
    storage: "128GB",
    camera: "48MP + 12MP",
    battery: "3349 mAh",
    color: "Hồng Pastel",
    imageUrl: "/products/iphone-16.png",
    description: "iPhone 15 màn hình Dynamic Island, cổng sạc Type-C tiện lợi và camera 48MP.",
  },
  {
    name: "iPhone 14 128GB",
    brandName: "Apple",
    categoryName: "Tầm trung",
    price: 16990000,
    salePrice: 15490000,
    stock: 35,
    screen: "6.1\" Super Retina XDR",
    chip: "Apple A15 Bionic",
    ram: "6GB",
    storage: "128GB",
    camera: "12MP + 12MP",
    battery: "3279 mAh",
    color: "Xanh Dương",
    imageUrl: "/products/iphone-16.png",
    description: "iPhone 14 cấu hình ổn định, giá mềm dễ tiếp cận, đáp ứng mượt mà mọi nhu cầu.",
  },

  // ===== SAMSUNG GALAXY (2025 - 2026) =====
  {
    name: "Samsung Galaxy S25 Ultra 1TB",
    brandName: "Samsung",
    categoryName: "Flagship",
    price: 44990000,
    salePrice: 39990000,
    stock: 15,
    screen: "6.9\" Dynamic AMOLED 2X 120Hz 2600 nits",
    chip: "Snapdragon 8 Elite For Galaxy",
    ram: "16GB",
    storage: "1TB",
    camera: "200MP OIS + 50MP Periscope + 50MP Ultra Wide + 10MP",
    battery: "5000 mAh (Sạc 45W)",
    color: "Titan Xám",
    imageUrl: "/products/galaxy-s25-ultra.jpg",
    description: "Samsung Galaxy S25 Ultra 1TB quyền năng Galaxy AI tối thượng, RAM 16GB đỉnh nóc công nghệ.",
  },
  {
    name: "Samsung Galaxy S25 Ultra 512GB",
    brandName: "Samsung",
    categoryName: "Flagship",
    price: 37990000,
    salePrice: 33990000,
    stock: 25,
    screen: "6.9\" Dynamic AMOLED 2X 120Hz",
    chip: "Snapdragon 8 Elite",
    ram: "12GB",
    storage: "512GB",
    camera: "200MP + 50MP + 50MP + 10MP",
    battery: "5000 mAh",
    color: "Đen Classic",
    imageUrl: "/products/galaxy-s25-ultra.jpg",
    description: "Samsung Galaxy S25 Ultra 512GB lưu trữ thoải mái, camera mắt thần bóng đêm đỉnh cao.",
  },
  {
    name: "Samsung Galaxy S25 Ultra 256GB",
    brandName: "Samsung",
    categoryName: "Flagship",
    price: 33990000,
    salePrice: 29990000,
    stock: 50,
    screen: "6.9\" Dynamic AMOLED 2X 120Hz",
    chip: "Snapdragon 8 Elite",
    ram: "12GB",
    storage: "256GB",
    camera: "200MP + 50MP + 50MP + 10MP",
    battery: "5000 mAh",
    color: "Titan Xám",
    imageUrl: "/products/galaxy-s25-ultra.jpg",
    description: "Samsung Galaxy S25 Ultra 256GB bán chạy nhất, bút S-Pen tích hợp, viền titan bo tròn êm tay.",
  },
  {
    name: "Samsung Galaxy S25 Plus 256GB",
    brandName: "Samsung",
    categoryName: "Flagship",
    price: 26990000,
    salePrice: 23990000,
    stock: 30,
    screen: "6.7\" Dynamic AMOLED 2X 120Hz",
    chip: "Snapdragon 8 Elite",
    ram: "12GB",
    storage: "256GB",
    camera: "50MP + 12MP + 10MP",
    battery: "4900 mAh",
    color: "Xanh Navy",
    imageUrl: "/products/galaxy-a56.jpg",
    description: "Samsung Galaxy S25 Plus thiết kế mỏng nhẹ, pin trâu 4900mAh và màn hình 2K+ siêu đẹp.",
  },
  {
    name: "Samsung Galaxy S25 256GB",
    brandName: "Samsung",
    categoryName: "Flagship",
    price: 24990000,
    salePrice: 21990000,
    stock: 35,
    screen: "6.2\" Dynamic AMOLED 2X 120Hz",
    chip: "Snapdragon 8 Elite",
    ram: "12GB",
    storage: "256GB",
    camera: "50MP + 12MP + 10MP",
    battery: "4000 mAh",
    color: "Bạc Ánh Trăng",
    imageUrl: "/products/galaxy-a56.jpg",
    description: "Samsung Galaxy S25 flagship nhỏ gọn nhất, cấu hình mạnh mẽ ngang hàng Ultra.",
  },
  {
    name: "Samsung Galaxy Z Fold6 256GB",
    brandName: "Samsung",
    categoryName: "Flagship",
    price: 43990000,
    salePrice: 39990000,
    stock: 15,
    screen: "7.6\" Gập Dynamic AMOLED 2X + 6.3\" Phụ",
    chip: "Snapdragon 8 Gen 3 For Galaxy",
    ram: "12GB",
    storage: "256GB",
    camera: "50MP + 12MP + 10MP",
    battery: "4400 mAh",
    color: "Xám Metal",
    imageUrl: "/products/galaxy-s25-ultra.jpg",
    description: "Samsung Galaxy Z Fold6 siêu phẩm màn hình gập mỏng nhẹ nhất, tối ưu đa nhiệm cùng Galaxy AI.",
  },
  {
    name: "Samsung Galaxy Z Flip6 256GB",
    brandName: "Samsung",
    categoryName: "Flagship",
    price: 28990000,
    salePrice: 24990000,
    stock: 25,
    screen: "6.7\" Gập 120Hz + 3.4\" FlexWindow",
    chip: "Snapdragon 8 Gen 3 For Galaxy",
    ram: "12GB",
    storage: "256GB",
    camera: "50MP + 12MP",
    battery: "4000 mAh",
    color: "Xanh Mint",
    imageUrl: "/products/galaxy-a56.jpg",
    description: "Samsung Galaxy Z Flip6 thiết kế hộp phấn gập thời trang, camera 50MP nâng cấp vượt trội.",
  },
  {
    name: "Samsung Galaxy A56 5G 128GB",
    brandName: "Samsung",
    categoryName: "Tầm trung",
    price: 10990000,
    salePrice: 9990000,
    stock: 60,
    screen: "6.7\" Super AMOLED 120Hz",
    chip: "Exynos 1580",
    ram: "8GB",
    storage: "128GB",
    camera: "50MP OIS + 12MP + 5MP",
    battery: "5000 mAh (Sạc 45W)",
    color: "Đen Bản Lĩnh",
    imageUrl: "/products/galaxy-a56.jpg",
    description: "Samsung Galaxy A56 5G kháng nước IP67, camera 50MP chống rung OIS, sạc nhanh 45W.",
  },
  {
    name: "Samsung Galaxy A36 5G 128GB",
    brandName: "Samsung",
    categoryName: "Tầm trung",
    price: 8490000,
    salePrice: 7690000,
    stock: 50,
    screen: "6.6\" Super AMOLED 120Hz",
    chip: "Snapdragon 6 Gen 3",
    ram: "8GB",
    storage: "128GB",
    camera: "50MP OIS + 8MP + 5MP",
    battery: "5000 mAh",
    color: "Tím Thời Thượng",
    imageUrl: "/products/galaxy-a56.jpg",
    description: "Samsung Galaxy A36 5G thiết kế viền mỏng thanh thoát, màn hình hiển thị sống động ngoài trời.",
  },
  {
    name: "Samsung Galaxy A16 5G 128GB",
    brandName: "Samsung",
    categoryName: "Phổ thông",
    price: 5990000,
    salePrice: 5390000,
    stock: 80,
    screen: "6.7\" Super AMOLED 90Hz",
    chip: "MediaTek Dimensity 6300",
    ram: "8GB",
    storage: "128GB",
    camera: "50MP + 5MP + 2MP",
    battery: "5000 mAh",
    color: "Xanh Năng Động",
    imageUrl: "/products/galaxy-a56.jpg",
    description: "Samsung Galaxy A16 5G hỗ trợ cập nhật phần mềm lên đến 6 năm, pin trâu giá hạt dẻ.",
  },
  {
    name: "Samsung Galaxy A06 64GB",
    brandName: "Samsung",
    categoryName: "Phổ thông",
    price: 3190000,
    salePrice: 2890000,
    stock: 100,
    screen: "6.7\" PLS LCD",
    chip: "Helio G85",
    ram: "4GB",
    storage: "64GB",
    camera: "50MP + 2MP",
    battery: "5000 mAh",
    color: "Xanh Lá",
    imageUrl: "/products/galaxy-a56.jpg",
    description: "Samsung Galaxy A06 màn hình cực lớn 6.7 inch, pin bền bỉ cho học sinh sinh viên.",
  },

  // ===== XIAOMI & REDMI (2025 - 2026) =====
  {
    name: "Xiaomi 15 Ultra 512GB",
    brandName: "Xiaomi",
    categoryName: "Flagship",
    price: 32990000,
    salePrice: 29990000,
    stock: 20,
    screen: "6.73\" LTPO AMOLED 2K 120Hz",
    chip: "Snapdragon 8 Elite",
    ram: "16GB",
    storage: "512GB",
    camera: "50MP 1-inch + 200MP Tele + 50MP + 50MP Leica",
    battery: "5410 mAh (Sạc 90W)",
    color: "Bạc Titan",
    imageUrl: "/products/xiaomi-15-ultra.jpg",
    description: "Xiaomi 15 Ultra ống kính Leica chuyên nghiệp, camera tiềm vọng 200MP siêu zoom.",
  },
  {
    name: "Xiaomi 15 256GB",
    brandName: "Xiaomi",
    categoryName: "Flagship",
    price: 22990000,
    salePrice: 20990000,
    stock: 30,
    screen: "6.36\" OLED 1.5K 120Hz viền siêu mỏng",
    chip: "Snapdragon 8 Elite",
    ram: "12GB",
    storage: "256GB",
    camera: "50MP Leica + 50MP Tele + 50MP Góc rộng",
    battery: "5400 mAh",
    color: "Trắng Gốm",
    imageUrl: "/products/xiaomi-15-ultra.jpg",
    description: "Xiaomi 15 kích thước vàng trong lòng bàn tay, viền màn hình chỉ 1.38mm siêu quyến rũ.",
  },
  {
    name: "Xiaomi 14T Pro 512GB",
    brandName: "Xiaomi",
    categoryName: "Flagship",
    price: 17990000,
    salePrice: 15990000,
    stock: 35,
    screen: "6.67\" AMOLED 144Hz 1.5K",
    chip: "Dimensity 9300+ 4nm",
    ram: "12GB",
    storage: "512GB",
    camera: "50MP Light Fusion 900 Leica + 50MP + 12MP",
    battery: "5000 mAh (Sạc 120W)",
    color: "Xám Titan",
    imageUrl: "/products/xiaomi-15-ultra.jpg",
    description: "Xiaomi 14T Pro chụp đêm đỉnh cao cùng Leica Summilux, sạc siêu tốc HyperCharge 120W.",
  },
  {
    name: "Xiaomi 14T 256GB",
    brandName: "Xiaomi",
    categoryName: "Tầm trung",
    price: 13990000,
    salePrice: 12490000,
    stock: 45,
    screen: "6.67\" AMOLED 144Hz",
    chip: "Dimensity 8300-Ultra",
    ram: "12GB",
    storage: "256GB",
    camera: "50MP Sony IMX906 Leica + 50MP + 12MP",
    battery: "5000 mAh",
    color: "Xanh Titan",
    imageUrl: "/products/xiaomi-15-ultra.jpg",
    description: "Xiaomi 14T nhiếp ảnh nghệ thuật Leica, thiết kế kim loại tinh xảo trong tầm giá.",
  },
  {
    name: "Redmi Note 14 Pro+ 5G 512GB",
    brandName: "Xiaomi",
    categoryName: "Tầm trung",
    price: 10990000,
    salePrice: 9990000,
    stock: 50,
    screen: "6.67\" AMOLED 1.5K 120Hz cong",
    chip: "Snapdragon 7s Gen 3",
    ram: "12GB",
    storage: "512GB",
    camera: "50MP Light Hunter 800 OIS + 50MP Tele + 8MP",
    battery: "6200 mAh (Sạc 90W)",
    color: "Xanh Cực Quang",
    imageUrl: "/products/redmi-note-14-pro.jpg",
    description: "Redmi Note 14 Pro+ pin khủng 6200 mAh, chống nước chuẩn IP68/IP69K siêu bền.",
  },
  {
    name: "Redmi Note 14 Pro 256GB",
    brandName: "Xiaomi",
    categoryName: "Tầm trung",
    price: 8490000,
    salePrice: 7690000,
    stock: 60,
    screen: "6.67\" AMOLED 1.5K 120Hz",
    chip: "Dimensity 7300-Ultra",
    ram: "8GB",
    storage: "256GB",
    camera: "200MP OIS + 8MP + 2MP",
    battery: "5500 mAh",
    color: "Tím Khói",
    imageUrl: "/products/redmi-note-14-pro.jpg",
    description: "Redmi Note 14 Pro camera 200MP bắt trọn khoảnh khắc, màn hình cong chống vỡ thế hệ mới.",
  },
  {
    name: "Redmi 14C 128GB",
    brandName: "Xiaomi",
    categoryName: "Phổ thông",
    price: 3490000,
    salePrice: 2990000,
    stock: 120,
    screen: "6.88\" IPS LCD 120Hz",
    chip: "Helio G81-Ultra",
    ram: "4GB",
    storage: "128GB",
    camera: "50MP + AI",
    battery: "5160 mAh",
    color: "Đen Ánh Sao",
    imageUrl: "/products/redmi-14c.jpg",
    description: "Redmi 14C thiết kế mặt lưng kính sang chảnh, màn hình siêu lớn 6.88 inch tần số quét 120Hz.",
  },
  {
    name: "POCO X7 Pro 256GB",
    brandName: "Xiaomi",
    categoryName: "Tầm trung",
    price: 9990000,
    salePrice: 8990000,
    stock: 40,
    screen: "6.67\" AMOLED 1.5K 120Hz",
    chip: "Dimensity 8400-Ultra",
    ram: "12GB",
    storage: "256GB",
    camera: "50MP OIS + 8MP",
    battery: "6000 mAh (Sạc 90W)",
    color: "Vàng Đen POCO",
    imageUrl: "/products/redmi-note-14-pro.jpg",
    description: "POCO X7 Pro cỗ máy chiến game tầm trung, tản nhiệt buồng hơi LiquidCool và pin 6000mAh.",
  },

  // ===== OPPO (2025 - 2026) =====
  {
    name: "OPPO Find X8 Pro 512GB",
    brandName: "OPPO",
    categoryName: "Flagship",
    price: 29990000,
    salePrice: 27990000,
    stock: 20,
    screen: "6.78\" LTPO AMOLED 120Hz 4500 nits",
    chip: "MediaTek Dimensity 9400",
    ram: "16GB",
    storage: "512GB",
    camera: "Hasselblad 4 camera 50MP (kép tiềm vọng)",
    battery: "5910 mAh (Sạc 80W)",
    color: "Trắng Ngọc Trai",
    imageUrl: "/products/oppo-reno-13f.jpg",
    description: "OPPO Find X8 Pro nhiếp ảnh đỉnh cao Hasselblad, chip Dimensity 9400 số 1 thế giới.",
  },
  {
    name: "OPPO Find X8 256GB",
    brandName: "OPPO",
    categoryName: "Flagship",
    price: 22990000,
    salePrice: 21490000,
    stock: 25,
    screen: "6.59\" AMOLED 120Hz viền mỏng đối xứng",
    chip: "MediaTek Dimensity 9400",
    ram: "12GB",
    storage: "256GB",
    camera: "50MP Hasselblad + 50MP Tele + 50MP Góc rộng",
    battery: "5630 mAh",
    color: "Xám Tinh Vân",
    imageUrl: "/products/oppo-reno-13f.jpg",
    description: "OPPO Find X8 thiết kế phẳng thời thượng, pin dung lượng cực lớn 5630 mAh.",
  },
  {
    name: "OPPO Reno13 Pro 512GB",
    brandName: "OPPO",
    categoryName: "Flagship",
    price: 15990000,
    salePrice: 14490000,
    stock: 30,
    screen: "6.83\" AMOLED 1.5K 120Hz",
    chip: "Dimensity 8350",
    ram: "12GB",
    storage: "512GB",
    camera: "50MP OIS + 50MP Tele chân dung 3.5x + 8MP",
    battery: "5800 mAh",
    color: "Tím Cánh Bướm",
    imageUrl: "/products/oppo-reno-13f.jpg",
    description: "OPPO Reno13 Pro chuyên gia chân dung thế hệ mới, thiết kế lưng cánh bướm chuyển màu huyền ảo.",
  },
  {
    name: "OPPO Reno13 F 256GB",
    brandName: "OPPO",
    categoryName: "Tầm trung",
    price: 8990000,
    salePrice: 8490000,
    stock: 50,
    screen: "6.67\" AMOLED 120Hz",
    chip: "Snapdragon 685",
    ram: "8GB",
    storage: "256GB",
    camera: "50MP + 8MP + 2MP",
    battery: "5800 mAh",
    color: "Xanh Bướm Đêm",
    imageUrl: "/products/oppo-reno-13f.jpg",
    description: "OPPO Reno13 F thiết kế thời trang, viền kim loại bo cong thanh lịch, pin siêu trâu 5800 mAh.",
  },
  {
    name: "OPPO A79 5G 256GB",
    brandName: "OPPO",
    categoryName: "Tầm trung",
    price: 7490000,
    salePrice: 6690000,
    stock: 60,
    screen: "6.72\" FHD+ 90Hz",
    chip: "MediaTek Dimensity 6020",
    ram: "8GB",
    storage: "256GB",
    camera: "50MP + 2MP",
    battery: "5000 mAh (Sạc SuperVOOC 33W)",
    color: "Tím Lông Vũ",
    imageUrl: "/products/oppo-reno-13f.jpg",
    description: "OPPO A79 5G loa kép âm thanh vòm sống động, mặt lưng phát sáng lông vũ độc đáo.",
  },
  {
    name: "OPPO A3 128GB",
    brandName: "OPPO",
    categoryName: "Phổ thông",
    price: 4990000,
    salePrice: 4490000,
    stock: 90,
    screen: "6.67\" 120Hz 1000 nits",
    chip: "Snapdragon 6s Gen 1",
    ram: "6GB",
    storage: "128GB",
    camera: "50MP + Cảm biến khử rung",
    battery: "5100 mAh (Sạc 45W)",
    color: "Trắng Ánh Sao",
    imageUrl: "/products/oppo-reno-13f.jpg",
    description: "OPPO A3 đạt chuẩn độ bền quân đội chống va đập, kháng nước mưa và kháng tia bắn.",
  },

  // ===== GOOGLE PIXEL (2025 - 2026) =====
  {
    name: "Google Pixel 9 Pro XL 256GB",
    brandName: "Google",
    categoryName: "Flagship",
    price: 28990000,
    salePrice: 26990000,
    stock: 20,
    screen: "6.8\" Super Actua LTPO OLED 120Hz 3000 nits",
    chip: "Google Tensor G4 (Titan M2)",
    ram: "16GB",
    storage: "256GB",
    camera: "50MP OIS + 48MP Tele 5x + 48MP Góc rộng",
    battery: "5060 mAh",
    color: "Obsidian (Đen)",
    imageUrl: "/products/pixel-9.jpg",
    description: "Google Pixel 9 Pro XL đỉnh cao Android nguyên bản, 16GB RAM tối ưu Gemini AI tân tiến nhất.",
  },
  {
    name: "Google Pixel 9 128GB",
    brandName: "Google",
    categoryName: "Flagship",
    price: 21990000,
    salePrice: 19990000,
    stock: 25,
    screen: "6.3\" Actua OLED 120Hz 2700 nits",
    chip: "Google Tensor G4",
    ram: "12GB",
    storage: "128GB",
    camera: "50MP + 48MP Ultra Wide",
    battery: "4700 mAh",
    color: "Wintergreen (Xanh Bạc Hà)",
    imageUrl: "/products/pixel-9.jpg",
    description: "Google Pixel 9 thiết kế thanh camera mới, chụp chân dung xoá phông tự nhiên số 1 thế giới.",
  },
  {
    name: "Google Pixel 8a 128GB",
    brandName: "Google",
    categoryName: "Tầm trung",
    price: 13990000,
    salePrice: 12490000,
    stock: 30,
    screen: "6.1\" OLED 120Hz Actua",
    chip: "Google Tensor G3",
    ram: "8GB",
    storage: "128GB",
    camera: "64MP OIS + 13MP",
    battery: "4492 mAh",
    color: "Bay (Xanh Da Trời)",
    imageUrl: "/products/pixel-9.jpg",
    description: "Google Pixel 8a máy nhỏ chụp ảnh siêu đẹp, cam kết cập nhật bảo mật liên tục 7 năm.",
  },
];

export default function AdminProducts() {
  const toast = useToast();
  const [filter, setFilter] = useState({ keyword: "", brandId: "", categoryId: "", page: 0 });
  const [editing, setEditing] = useState(null); // null: đóng, {}: thêm mới, {...}: sửa/nhân bản
  const meta = useLoad(() => Promise.all([api("/api/brands"), api("/api/categories")]), []);
  const { data, loading, reload } = useLoad(() => api("/api/admin/products", { query: { ...filter, size: 20 } }), [filter]);
  const [brands, cats] = meta.data || [[], []];

  const openEdit = async (id) => {
    try {
      setEditing(await api("/api/admin/products/" + id));
    } catch (e) {
      toast(e.message, "error");
    }
  };

  // Nút Nhân bản: Sao chép mọi thứ từ sản phẩm có sẵn
  const openClone = async (id) => {
    try {
      const orig = await api("/api/admin/products/" + id);
      const clone = {
        ...orig,
        id: undefined,
        name: orig.name + " (Bản sao)",
        soldCount: 0,
        viewCount: 0,
        stock: orig.stock || 20,
        active: true,
      };
      setEditing(clone);
      toast("Đã nhân bản thông số sản phẩm!", "ok");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const deactivate = async (id) => {
    if (!confirm("Ngừng bán sản phẩm này? Lịch sử đơn hàng vẫn được giữ nguyên.")) return;
    try {
      await api("/api/admin/products/" + id, { method: "DELETE" });
      toast("Đã ngừng bán");
      reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const openNew = () => {
    if (!brands.length || !cats.length) {
      toast("Cần tạo hãng và phân khúc trước", "error");
      return;
    }
    setEditing({});
  };

  return (
    <>
      <AdminHead title="Quản lý Sản phẩm">
        <button className="btn btn-primary" onClick={openNew}>
          + Thêm sản phẩm
        </button>
      </AdminHead>

      <form
        className="mb-3.5 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setFilter({ ...Object.fromEntries(new FormData(e.currentTarget)), page: 0 });
        }}
      >
        <input name="keyword" placeholder="Tên sản phẩm" aria-label="Tên sản phẩm" className="input w-auto min-w-48" />
        <select name="brandId" aria-label="Hãng" className="input w-auto">
          <option value="">Mọi hãng</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select name="categoryId" aria-label="Phân khúc" className="input w-auto">
          <option value="">Mọi phân khúc</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn">Lọc</button>
      </form>

      {loading && !data ? (
        <Loading />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th />
                <th>Tên</th>
                <th>Hãng</th>
                <th>Giá bán</th>
                <th>Giá KM</th>
                <th>Tồn</th>
                <th>Đã bán</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.map((p) => (
                <tr key={p.id}>
                  <td>
                    <ProductImage src={p.imageUrl} alt={p.name} className="w-11" />
                  </td>
                  <td>
                    {p.name}
                    {p.hot && <span className="ml-1.5 rounded-full bg-paper px-2 py-0.5 text-xs font-semibold text-price">Hot</span>}
                  </td>
                  <td>{p.brandName}</td>
                  <td className="tabular-nums font-semibold">{vnd(p.price)}</td>
                  <td className="tabular-nums text-price font-semibold">{p.salePrice ? vnd(p.salePrice) : "—"}</td>
                  <td className={`tabular-nums ${p.stock <= 5 ? "font-bold text-price" : ""}`}>{p.stock}</td>
                  <td className="tabular-nums">{p.soldCount}</td>
                  <td>
                    {p.active ? (
                      <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ok">Đang bán</span>
                    ) : (
                      <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink-3">Ngừng bán</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-right space-x-1">
                    <button
                      className="btn btn-sm text-accent hover:border-accent"
                      title="Nhân bản sản phẩm này để tạo mới nhanh"
                      onClick={() => openClone(p.id)}
                    >
                      📋 Nhân bản
                    </button>
                    <button className="btn btn-sm" onClick={() => openEdit(p.id)}>
                      Sửa
                    </button>
                    {p.active && (
                      <button className="btn btn-sm btn-danger" onClick={() => deactivate(p.id)}>
                        Ngừng bán
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data && !data.content.length && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-ink-3">
                    Không có sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pager data={data} onChange={(page) => setFilter((f) => ({ ...f, page }))} />

      {editing && (
        <ProductForm
          product={editing}
          brands={brands}
          cats={cats}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function ProductForm({ product: initialP, brands, cats, onClose, onSaved }) {
  const toast = useToast();
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const isNew = !initialP.id;

  const [formData, setFormData] = useState({
    name: initialP.name || "",
    brandId: initialP.brandId ?? brands[0]?.id ?? "",
    categoryId: initialP.categoryId ?? cats[0]?.id ?? "",
    price: initialP.price ?? "",
    salePrice: initialP.salePrice ?? "",
    stock: initialP.stock ?? 20,
    imageUrl: initialP.imageUrl || QUICK_PRESETS[0].imageUrl,
    screen: initialP.screen || "",
    chip: initialP.chip || "",
    ram: initialP.ram || "",
    storage: initialP.storage || "",
    camera: initialP.camera || "",
    battery: initialP.battery || "",
    color: initialP.color || "",
    description: initialP.description || "",
    hot: initialP.hot || false,
    active: initialP.active ?? true,
    colors: initialP.colors
      ? initialP.colors.map((c) => ({
          id: c.id,
          colorName: c.colorName,
          hex: c.hex || "#3B3F55",
          price: c.price,
          salePrice: c.salePrice || "",
          stock: c.stock != null ? c.stock : 0,
          imageUrl: c.imageUrl || "",
        }))
      : [],
  });

  const syncPriceToAllColors = () => {
    if (!formData.price) return;
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => ({
        ...c,
        price: Number(prev.price),
      })),
    }));
    toast("Đã áp dụng giá niêm yết cho tất cả các màu!", "ok");
  };

  const handleColorChange = (index, field, value) => {
    setFormData((prev) => {
      const nextColors = [...prev.colors];
      nextColors[index] = { ...nextColors[index], [field]: value };
      return { ...prev, colors: nextColors };
    });
  };

  const addColorRow = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          id: null,
          colorName: "",
          hex: "#3B3F55",
          price: prev.price || 0,
          salePrice: prev.salePrice || "",
          stock: 10,
          imageUrl: prev.imageUrl || "",
        },
      ],
    }));
  };

  const removeColorRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // THÊM NHANH: Chọn mẫu điện thoại có sẵn để tự động điền toàn bộ thông số và có sẵn ảnh
  const applyPreset = (preset) => {
    const matchedBrand = brands.find((b) => b.name.toLowerCase() === preset.brandName.toLowerCase());
    const matchedCat = cats.find((c) => c.name.toLowerCase() === preset.categoryName.toLowerCase());

    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      brandId: matchedBrand ? matchedBrand.id : prev.brandId || brands[0]?.id,
      categoryId: matchedCat ? matchedCat.id : prev.categoryId || cats[0]?.id,
      price: preset.price,
      salePrice: preset.salePrice || "",
      costPrice: Math.round(preset.price * 0.78),
      stock: preset.stock,
      imageUrl: preset.imageUrl,
      screen: preset.screen,
      chip: preset.chip,
      ram: preset.ram,
      storage: preset.storage,
      camera: preset.camera,
      battery: preset.battery,
      color: preset.color,
      description: preset.description,
      hot: true,
      active: true,
    }));

    toast(`Đã điền tự động sản phẩm: ${preset.name}!`, "ok");
  };

  // Tải ảnh từ máy tính
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.url) {
        setFormData((prev) => ({ ...prev, imageUrl: json.url }));
        toast("Đã chọn ảnh từ máy tính thành công!", "ok");
      } else {
        throw new Error(json.error || "Không thể tải ảnh");
      }
    } catch (err) {
      toast("Lỗi tải ảnh: " + err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const num = (x) => (x === "" || x == null ? null : Number(x));

    const body = {
      ...formData,
      price: num(formData.price),
      salePrice: num(formData.salePrice),
      costPrice: initialP.costPrice != null ? initialP.costPrice : Math.round(num(formData.price) * 0.78),
      stock: num(formData.stock),
      brandId: num(formData.brandId),
      categoryId: num(formData.categoryId),
      colors:
        formData.colors && formData.colors.length > 0
          ? formData.colors.map((c) => ({
              id: c.id || null,
              colorName: (c.colorName || "").trim(),
              hex: c.hex || "#3B3F55",
              price: num(c.price) != null ? num(c.price) : num(formData.price),
              salePrice: num(c.salePrice),
              stock: num(c.stock) != null ? num(c.stock) : 0,
              imageUrl: c.imageUrl || null,
            }))
          : null,
    };

    try {
      await api(isNew ? "/api/admin/products" : "/api/admin/products/" + initialP.id, {
        method: isNew ? "POST" : "PUT",
        body,
      });

      toast(isNew ? "Đã thêm sản phẩm thành công!" : "Đã lưu thay đổi!");
      onSaved();
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.message, "error");
    }
  };

  // Các hãng được nhóm để hiển thị trong select
  const brandGroups = ["Apple", "Samsung", "Xiaomi", "OPPO", "Google"];

  return (
    <Modal title={isNew ? (initialP.name ? "Nhân bản sản phẩm" : "Thêm sản phẩm mới") : "Sửa sản phẩm"} onClose={onClose}>
      {/* 1. THANH THÊM SẢN PHẨM NHANH (HƠN 35+ MẪU MỚI NĂM NAY) */}
      {isNew && (
        <div className="mb-4 rounded-xl border border-line bg-paper p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-ink">Thêm nhanh mẫu máy năm nay (Hơn 35+ mẫu mới nhất):</span>
            <span className="text-[11px] text-accent font-semibold">Tự điền 100% kèm ảnh</span>
          </div>
          <select
            className="input text-xs font-medium cursor-pointer bg-surface"
            defaultValue=""
            onChange={(e) => {
              const found = QUICK_PRESETS.find((p) => p.name === e.target.value);
              if (found) applyPreset(found);
            }}
          >
            <option value="">-- Bấm vào đây để chọn nhanh mẫu điện thoại hot năm nay --</option>
            {brandGroups.map((bName) => {
              const items = QUICK_PRESETS.filter((p) => p.brandName === bName);
              if (!items.length) return null;
              return (
                <optgroup key={bName} label={`=== HÃNG ${bName.toUpperCase()} (${items.length} mẫu hot theo Series) ===`}>
                  {items.map((item) => {
                    const seriesTag = item.name.includes("Galaxy S")
                      ? "[Galaxy S]"
                      : item.name.includes("Galaxy Z")
                      ? "[Galaxy Z (Gập)]"
                      : item.name.includes("Galaxy A")
                      ? "[Galaxy A]"
                      : item.name.includes("Galaxy M")
                      ? "[Galaxy M]"
                      : item.name.includes("iPhone 16")
                      ? "[iPhone 16 Series]"
                      : item.name.includes("iPhone 15")
                      ? "[iPhone 15 Series]"
                      : item.name.includes("Redmi Note")
                      ? "[Redmi Note]"
                      : item.name.includes("Reno")
                      ? "[Reno Series]"
                      : "";
                    return (
                      <option key={item.name} value={item.name}>
                        {seriesTag ? `${seriesTag} ` : ""}{item.name} — {vnd(item.price)}
                      </option>
                    );
                  })}
                </optgroup>
              );
            })}
          </select>
        </div>
      )}

      <form noValidate onSubmit={submit} className="space-y-3.5">
        {/* 2. PHẦN HÌNH ẢNH CƠ BẢN */}
        <div className="rounded-xl border border-line bg-paper/50 p-3">
          <label className="label mb-2 font-bold text-ink">Hình ảnh sản phẩm</label>
          <div className="flex items-center gap-3.5">
            {/* Ảnh xem trước */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-surface grid place-items-center shadow-xs">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Ảnh sản phẩm" className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-[11px] text-ink-3 text-center px-1">Chưa có ảnh</span>
              )}
            </div>

            {/* Nút bấm chọn ảnh từ máy */}
            <div className="space-y-1">
              <label className="btn btn-sm btn-primary cursor-pointer">
                Chọn ảnh từ máy tính
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
              {uploading && <span className="ml-2 text-xs text-ink-3 animate-pulse">Đang tải...</span>}
              <p className="text-[11px] text-ink-3">
                {formData.imageUrl ? "Đã có ảnh sản phẩm" : "Chưa có ảnh. Bấm nút để chọn ảnh từ máy."}
              </p>
            </div>
          </div>
        </div>

        {/* 3. THÔNG TIN BẮT BUỘC CƠ BẢN */}
        <div>
          <label className="label">Tên sản phẩm *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ví dụ: iPhone 16 Pro Max 256GB"
            className="input font-medium"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <div>
            <label className="label">Hãng *</label>
            <select name="brandId" value={formData.brandId} onChange={handleChange} className="input">
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Phân khúc *</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="input">
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label mb-0">Giá bán niêm yết (đ) *</label>
              {formData.colors && formData.colors.length > 0 && (
                <button
                  type="button"
                  onClick={syncPriceToAllColors}
                  className="text-[10px] text-accent hover:underline font-semibold"
                  title="Áp dụng giá niêm yết này cho tất cả các màu bên dưới"
                >
                  ⚡ Đặt cho tất cả màu
                </button>
              )}
            </div>
            <input
              type="number"
              min="0"
              step="1000"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Ví dụ: 34990000"
              className="input font-semibold mt-1"
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div>
            <label className="label">Giá khuyến mãi (đ)</label>
            <input
              type="number"
              min="0"
              step="1000"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              placeholder="Để trống nếu không giảm"
              className="input"
            />
          </div>

          <div>
            <label className="label">Số lượng tồn kho</label>
            <input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} className="input" />
          </div>

          <div>
            <label className="label">Màu sắc mặc định</label>
            <input name="color" value={formData.color} onChange={handleChange} placeholder="Ví dụ: Titan Sa Mạc" className="input" />
          </div>
        </div>

        {/* 3.1. BẢNG MÀU SẮC, GIÁ RIÊNG VÀ SỐ LƯỢNG KHO RIÊNG LƯU TRỰC TIẾP DATABASE */}
        <div className="rounded-xl border border-line bg-surface p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-ink">🎨 Bảng màu sắc, Giá & Số lượng riêng (Lưu trực tiếp Database)</div>
              <div className="text-[11px] text-ink-3">Thiết lập giá niêm yết, giá giảm và số lượng tồn kho riêng biệt cho từng màu</div>
            </div>
            <button
              type="button"
              onClick={addColorRow}
              className="btn btn-xs btn-outline text-accent font-semibold"
            >
              + Thêm màu mới
            </button>
          </div>

          {formData.colors && formData.colors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line text-ink-3">
                    <th className="py-2 pr-2">Tên màu</th>
                    <th className="py-2 pr-2 w-28">Mã Hex</th>
                    <th className="py-2 pr-2">Giá niêm yết</th>
                    <th className="py-2 pr-2">Giá khuyến mãi</th>
                    <th className="py-2 pr-2 w-20">Tồn kho</th>
                    <th className="py-2 text-center w-12">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {formData.colors.map((c, i) => (
                    <tr key={i} className="hover:bg-paper/50">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={c.colorName}
                          onChange={(e) => handleColorChange(i, "colorName", e.target.value)}
                          placeholder="VD: Titan Sa Mạc"
                          className="input text-xs py-1 h-8"
                          required
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={c.hex || "#3B3F55"}
                            onChange={(e) => handleColorChange(i, "hex", e.target.value)}
                            className="h-7 w-7 rounded cursor-pointer border border-line p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={c.hex}
                            onChange={(e) => handleColorChange(i, "hex", e.target.value)}
                            className="input text-[11px] py-1 h-8 font-mono w-20"
                          />
                        </div>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={c.price}
                          onChange={(e) => handleColorChange(i, "price", e.target.value)}
                          placeholder="Giá niêm yết"
                          className="input text-xs py-1 h-8 tabular-nums"
                          required
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={c.salePrice}
                          onChange={(e) => handleColorChange(i, "salePrice", e.target.value)}
                          placeholder="Để trống nếu không giảm"
                          className="input text-xs py-1 h-8 tabular-nums"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          min="0"
                          value={c.stock}
                          onChange={(e) => handleColorChange(i, "stock", e.target.value)}
                          className="input text-xs py-1 h-8 tabular-nums text-center font-bold"
                          required
                        />
                      </td>
                      <td className="py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeColorRow(i)}
                          className="text-red-500 hover:text-red-700 font-bold p-1 text-sm"
                          title="Xóa màu này"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 bg-paper rounded-lg text-center text-xs text-ink-3">
              Chưa có cấu hình màu riêng lẻ trong Database. Bấm <strong>&quot;+ Thêm màu mới&quot;</strong> để tạo các phân loại màu sắc riêng.
            </div>
          )}
        </div>

        {/* 4. THÔNG SỐ RÚT GỌN (LƯỜI NHẬP THÌ ĐỂ NGUYÊN) */}
        <div className="rounded-xl border border-line bg-surface p-3">
          <button
            type="button"
            onClick={() => setShowSpecs(!showSpecs)}
            className="flex w-full items-center justify-between text-xs font-bold text-ink"
          >
            <span>⚙️ Chi tiết thông số (Chip, RAM, Camera, Pin... - Không bắt buộc)</span>
            <span className="text-accent">{showSpecs ? "▲ Thu gọn" : "▼ Mở ra xem/sửa"}</span>
          </button>

          {showSpecs && (
            <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-line max-sm:grid-cols-1">
              <div>
                <label className="label">Màn hình</label>
                <input name="screen" value={formData.screen} onChange={handleChange} placeholder="6.9 inch OLED 120Hz" className="input text-xs" />
              </div>
              <div>
                <label className="label">Chip</label>
                <input name="chip" value={formData.chip} onChange={handleChange} placeholder="Apple A18 Pro / Snapdragon 8 Elite" className="input text-xs" />
              </div>
              <div>
                <label className="label">RAM</label>
                <input name="ram" value={formData.ram} onChange={handleChange} placeholder="8GB / 12GB / 16GB" className="input text-xs" />
              </div>
              <div>
                <label className="label">Bộ nhớ trong</label>
                <input name="storage" value={formData.storage} onChange={handleChange} placeholder="256GB / 512GB / 1TB" className="input text-xs" />
              </div>
              <div>
                <label className="label">Camera</label>
                <input name="camera" value={formData.camera} onChange={handleChange} placeholder="48MP / 200MP" className="input text-xs" />
              </div>
              <div>
                <label className="label">Pin</label>
                <input name="battery" value={formData.battery} onChange={handleChange} placeholder="5000 mAh" className="input text-xs" />
              </div>
              <div className="col-span-2 max-sm:col-span-1">
                <label className="label">Mô tả sản phẩm</label>
                <textarea name="description" rows={2} value={formData.description} onChange={handleChange} className="input text-xs" />
              </div>
            </div>
          )}
        </div>

        {/* 5. TÙY CHỌN */}
        <div className="flex items-center gap-6 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="hot" checked={formData.hot} onChange={handleChange} />
            <span className="font-semibold text-price">Sản phẩm Hot</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
            <span className="font-semibold text-ok">Đang mở bán</span>
          </label>
        </div>

        {/* 6. NÚT LƯU */}
        <div className="flex justify-end gap-2 pt-3 border-t border-line">
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-primary">Lưu sản phẩm</button>
        </div>
      </form>
    </Modal>
  );
}
