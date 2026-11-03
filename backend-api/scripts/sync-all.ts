import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fnkcwfshexmsmzlncbvd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_2yHDNUqkgR-RR463ER4sFA_JYH-mhh0';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.fnkcwfshexmsmzlncbvd:Huutuyen123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

interface ImageInfo {
  filename: string;
  localPath: string;
  sizeBytes: number;
  sha256: string;
  prefix16: string;
  category: string;
  caption: string;
  role: 'COVER' | 'GALLERY';
  storageKey: string;
  publicUrl: string;
  width: number;
  height: number;
  isDuplicate: boolean;
  duplicateOf?: string;
  roomTypeKeyword?: string;
}

const IMAGES_METADATA: ImageInfo[] = [
  {
    filename: 'IMG_5493.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5493.JPG',
    sizeBytes: 968650,
    sha256: '675ba50952fbf11ff7c5ecd3a70536975650d249c19aea480840dce409ba6638',
    prefix16: '675ba50952fbf11f',
    category: 'OVERVIEW',
    caption: 'Dãy bungalow nứa mái lá và khuôn viên sân ngắm núi',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/675ba50952fbf11f.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/675ba50952fbf11f.jpg`,
    width: 1444,
    height: 2568,
    isDuplicate: false
  },
  {
    filename: 'IMG_5495.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5495.JPG',
    sizeBytes: 1095042,
    sha256: '81b08a00548e32bd12aee6cc946febfc2d1a8bb78900987528a4a8993ce711e7',
    prefix16: '81b08a00548e32bd',
    category: 'VIEW_BALCONY',
    caption: 'Góc ban công ngắm nhìn trọn vẹn ruộng bậc thang xanh ngát',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/81b08a00548e32bd.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/81b08a00548e32bd.jpg`,
    width: 1444,
    height: 2568,
    isDuplicate: false
  },
  {
    filename: 'IMG_5496.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5496.JPG',
    sizeBytes: 1028268,
    sha256: '101e48c74cbaa98d7d3fa49c4186f68c3311e064aefcc8430304269693cfd9c9',
    prefix16: '101e48c74cbaa98d',
    category: 'ROOM_DOUBLE',
    caption: 'Phòng đôi rộng rãi 2 giường lớn với trần sao LED và view thung lũng',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/101e48c74cbaa98d.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/101e48c74cbaa98d.jpg`,
    width: 2560,
    height: 1920,
    isDuplicate: false,
    roomTypeKeyword: 'đôi'
  },
  {
    filename: 'IMG_5498.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5498.JPG',
    sizeBytes: 178907,
    sha256: 'd55512db1290951a1deb714b36d91b9bd62727db109231609d59a219300e29f0',
    prefix16: 'd55512db1290951a',
    category: 'ROOM_DORM',
    caption: 'Gian phòng sàn gỗ truyền thống sạch sẽ với rèm ngăn riêng tư từng đệm',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/d55512db1290951a.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/d55512db1290951a.jpg`,
    width: 1280,
    height: 960,
    isDuplicate: false,
    roomTypeKeyword: 'sàn'
  },
  {
    filename: 'IMG_5499.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5499.JPG',
    sizeBytes: 175120,
    sha256: '497211fb4043ebf1a5dc842161160399e0606ddfd7b0b7863c8003d29765ae22',
    prefix16: '497211fb4043ebf1',
    category: 'ROOM_WOODEN',
    caption: 'Phòng nhà gỗ ấm cúng với gác lửng, bàn trà và trang thiết bị hiện đại',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/497211fb4043ebf1.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/497211fb4043ebf1.jpg`,
    width: 1280,
    height: 960,
    isDuplicate: false,
    roomTypeKeyword: 'gỗ'
  },
  {
    filename: 'IMG_5500.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5500.JPG',
    sizeBytes: 160189,
    sha256: 'af24e067703573f9ca0c4451a6ec507f40032eedbf35013965dc8864e182d736',
    prefix16: 'af24e067703573f9',
    category: 'ROOM_BUNGALOW',
    caption: 'Bên trong bungalow tam giác ốp gỗ thông thơm mộc mạc',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/af24e067703573f9.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/af24e067703573f9.jpg`,
    width: 1280,
    height: 960,
    isDuplicate: false,
    roomTypeKeyword: 'gỗ'
  },
  {
    filename: 'IMG_5501.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5501.JPG',
    sizeBytes: 1028268,
    sha256: '101e48c74cbaa98d7d3fa49c4186f68c3311e064aefcc8430304269693cfd9c9',
    prefix16: '101e48c74cbaa98d',
    category: 'DUPLICATE',
    caption: 'Ảnh trùng hoàn toàn SHA-256 với IMG_5496.JPG',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/101e48c74cbaa98d.jpg',
    publicUrl: '',
    width: 2560,
    height: 1920,
    isDuplicate: true,
    duplicateOf: 'IMG_5496.JPG'
  },
  {
    filename: 'IMG_5502.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5502.JPG',
    sizeBytes: 561622,
    sha256: 'e895cf1ff91cf2c3a72cd13c8671a8187fe7287d0cba11b04b8e39621781349c',
    prefix16: 'e895cf1ff91cf2c3',
    category: 'ROOM_SINGLE',
    caption: 'Phòng đơn ấm áp với giường đôi êm ái nhìn ra vườn',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/e895cf1ff91cf2c3.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/e895cf1ff91cf2c3.jpg`,
    width: 1436,
    height: 2560,
    isDuplicate: false,
    roomTypeKeyword: 'đơn'
  },
  {
    filename: 'IMG_5503.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5503.JPG',
    sizeBytes: 411085,
    sha256: 'fb1a1ccce625a554f876acd81cbf6e9ae08d085e427ea9a30ebcfb0eab37afd1',
    prefix16: 'fb1a1ccce625a554',
    category: 'HOSPITALITY',
    caption: 'Chủ nhà thân thiện trang phục Thái bản địa đón khách niềm nở',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/fb1a1ccce625a554.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/fb1a1ccce625a554.jpg`,
    width: 1436,
    height: 2560,
    isDuplicate: false
  },
  {
    filename: 'IMG_5504.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5504.JPG',
    sizeBytes: 569322,
    sha256: 'd90fff5ee41be4c3613771dfb6bd419220b8176426097524517f4cc27fb579ae',
    prefix16: 'd90fff5ee41be4c3',
    category: 'COVER',
    caption: 'Góc ban công thảnh thơi ngắm biển lúa Mù Cang Chải',
    role: 'COVER',
    storageKey: 'homestays/homestay-anh-tuc/d90fff5ee41be4c3.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/d90fff5ee41be4c3.jpg`,
    width: 2560,
    height: 1436,
    isDuplicate: false
  },
  {
    filename: 'IMG_5505.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5505.JPG',
    sizeBytes: 941047,
    sha256: 'f1963ac1e63c8935582b481ae4b94c3eabea515c9b77b18bbf91c4763769329f',
    prefix16: 'f1963ac1e63c8935',
    category: 'BUNGALOW_EXTERIOR',
    caption: 'Bungalow tam giác riêng tư giữa khu vườn xanh mát',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/f1963ac1e63c8935.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/f1963ac1e63c8935.jpg`,
    width: 1436,
    height: 2560,
    isDuplicate: false
  },
  {
    filename: 'IMG_5506.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5506.JPG',
    sizeBytes: 372271,
    sha256: '2cb30e19237436d4c3f25c6fe6f872e243192e96144039af1d98d13e6b961ff7',
    prefix16: '2cb30e19237436d4',
    category: 'ROOM_BUNGALOW',
    caption: 'Nội thất phòng ngủ trang nhã, chăn ga đệm trắng tinh tươm',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/2cb30e19237436d4.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/2cb30e19237436d4.jpg`,
    width: 1436,
    height: 2560,
    isDuplicate: false,
    roomTypeKeyword: 'gỗ'
  },
  {
    filename: 'IMG_5507.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5507.JPG',
    sizeBytes: 297344,
    sha256: '46fca0e93167dae848d04b952a667e93a71090e1517deb3c7ca0b5e58e7e8f7f',
    prefix16: '46fca0e93167dae8',
    category: 'SERVICE',
    caption: 'Dịch vụ buồng phòng chu đáo, nệm êm sạch sẽ sẵn sàng đón khách',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/46fca0e93167dae8.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/46fca0e93167dae8.jpg`,
    width: 2560,
    height: 1436,
    isDuplicate: false
  },
  {
    filename: 'IMG_5508.JPG',
    localPath: 'c:/Users/TUYEN/Desktop/didulich/backend-api/temp_images/ẢNH TỔNG QUAN + PHÒNG/IMG_5508.JPG',
    sizeBytes: 1666344,
    sha256: 'b765eab25837b5e435ebf9e5ea18355f3c8af0c3e4595169c4bc9a31236e2f16',
    prefix16: 'b765eab25837b5e4',
    category: 'GARDEN_OVERVIEW',
    caption: 'Toàn cảnh cụm bungalow hòa mình giữa đồi núi mây ngàn',
    role: 'GALLERY',
    storageKey: 'homestays/homestay-anh-tuc/b765eab25837b5e4.jpg',
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/viettrek-media/homestays/homestay-anh-tuc/b765eab25837b5e4.jpg`,
    width: 2560,
    height: 1436,
    isDuplicate: false
  }
];

// Room types to add
interface NewRoomSpec {
  placeId: number;
  placeName: string;
  name: string;
  description: string;
  totalRoomCount: number;
  maxOccupancy: number;
  privateBathroom: 'YES' | 'NO' | 'UNVERIFIED';
  basePrice: number | null;
  weekendPrice: number | null;
  beds: Array<{ bedType: string; quantity: number }>;
}

const NEW_ROOM_SPECS: NewRoomSpec[] = [
  // Homestay Anh Túc (ID 1)
  {
    placeId: 1,
    placeName: 'Homestay Anh Túc',
    name: 'Phòng nhà gỗ',
    description: 'Căn phòng nhà gỗ bungalow biệt lập có gác lửng, bàn trà và điều hòa',
    totalRoomCount: 1,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 600000,
    weekendPrice: 800000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  },
  // Homestay Cường Tú (ID 9)
  {
    placeId: 9,
    placeName: 'Homestay Cường Tú',
    name: 'Nhà sàn tập thể (có rèm ngăn)',
    description: 'Không gian nhà sàn truyền thống gỗ pơ mu có rèm ngăn riêng từng đệm',
    totalRoomCount: 1,
    maxOccupancy: 20,
    privateBathroom: 'NO',
    basePrice: 150000,
    weekendPrice: 180000,
    beds: [{ bedType: 'FUTON', quantity: 20 }]
  },
  // Homestay Bảo Lan (ID 10)
  {
    placeId: 10,
    placeName: 'Homestay Bảo Lan',
    name: 'Nhà sàn tập thể',
    description: 'Nhà sàn cộng đồng rộng rãi thoáng mát view đồi núi',
    totalRoomCount: 1,
    maxOccupancy: 20,
    privateBathroom: 'NO',
    basePrice: 150000,
    weekendPrice: 180000,
    beds: [{ bedType: 'FUTON', quantity: 20 }]
  },
  {
    placeId: 10,
    placeName: 'Homestay Bảo Lan',
    name: 'Phòng đơn',
    description: 'Phòng riêng 1 giường đôi khép kín',
    totalRoomCount: 2,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 400000,
    weekendPrice: 500000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  },
  {
    placeId: 10,
    placeName: 'Homestay Bảo Lan',
    name: 'Phòng đôi',
    description: 'Phòng riêng 2 giường đôi phù hợp gia đình hoặc nhóm bạn',
    totalRoomCount: 2,
    maxOccupancy: 4,
    privateBathroom: 'YES',
    basePrice: 600000,
    weekendPrice: 750000,
    beds: [{ bedType: 'DOUBLE', quantity: 2 }]
  },
  // Mộc Homestay (ID 14)
  {
    placeId: 14,
    placeName: 'Mộc Homestay',
    name: 'Phòng 4 người',
    description: 'Phòng nghỉ tiện nghi cho đoàn 4 khách view thoáng mát',
    totalRoomCount: 6,
    maxOccupancy: 4,
    privateBathroom: 'YES',
    basePrice: 600000,
    weekendPrice: 800000,
    beds: [{ bedType: 'DOUBLE', quantity: 2 }]
  },
  // Bungalow Xuân Giang (ID 15)
  {
    placeId: 15,
    placeName: 'Bungalow Xuân Giang',
    name: 'Bungalow 3 giường',
    description: 'Căn bungalow rộng rãi 3 giường lớn phục vụ nhóm hoặc gia đình lớn',
    totalRoomCount: 1,
    maxOccupancy: 6,
    privateBathroom: 'YES',
    basePrice: 1200000,
    weekendPrice: 1500000,
    beds: [{ bedType: 'DOUBLE', quantity: 3 }]
  },
  // Chelly Hotel (ID 17)
  {
    placeId: 17,
    placeName: 'Chelly Hotel',
    name: 'Phòng đơn',
    description: 'Phòng khách sạn 1 giường đôi tiện nghi đầy đủ',
    totalRoomCount: 9,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 400000,
    weekendPrice: 500000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  },
  {
    placeId: 17,
    placeName: 'Chelly Hotel',
    name: 'Phòng đôi',
    description: 'Phòng khách sạn 2 giường đôi rộng rãi',
    totalRoomCount: 1,
    maxOccupancy: 4,
    privateBathroom: 'YES',
    basePrice: 600000,
    weekendPrice: 750000,
    beds: [{ bedType: 'DOUBLE', quantity: 2 }]
  },
  // Đồi Đổi Gió (ID 19)
  {
    placeId: 19,
    placeName: 'Đồi Đổi Gió',
    name: 'Phòng Triple (3 giường)',
    description: 'Phòng nghỉ 3 giường tiêu chuẩn nhìn ra đồi gió',
    totalRoomCount: 1,
    maxOccupancy: 3,
    privateBathroom: 'YES',
    basePrice: 800000,
    weekendPrice: 1000000,
    beds: [{ bedType: 'SINGLE', quantity: 3 }]
  },
  // Sky Motel (ID 22)
  {
    placeId: 22,
    placeName: 'Sky Motel',
    name: 'Phòng đơn',
    description: 'Phòng nghỉ 1 giường đôi trung tâm thị trấn',
    totalRoomCount: 5,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 400000,
    weekendPrice: 500000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  },
  {
    placeId: 22,
    placeName: 'Sky Motel',
    name: 'Phòng đôi',
    description: 'Phòng nghỉ 2 giường đôi tiện nghi',
    totalRoomCount: 6,
    maxOccupancy: 4,
    privateBathroom: 'YES',
    basePrice: 600000,
    weekendPrice: 750000,
    beds: [{ bedType: 'DOUBLE', quantity: 2 }]
  },
  // Nhà nghỉ Ngủ (ID 24)
  {
    placeId: 24,
    placeName: 'Nhà nghỉ Ngủ',
    name: 'Phòng 1 giường đôi',
    description: 'Phòng 1 giường đôi sạch sẽ ấm cúng',
    totalRoomCount: 6,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 350000,
    weekendPrice: 450000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  },
  {
    placeId: 24,
    placeName: 'Nhà nghỉ Ngủ',
    name: 'Phòng 2 giường đơn',
    description: 'Phòng 2 giường đơn tách biệt',
    totalRoomCount: 2,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 400000,
    weekendPrice: 500000,
    beds: [{ bedType: 'SINGLE', quantity: 2 }]
  },
  {
    placeId: 24,
    placeName: 'Nhà nghỉ Ngủ',
    name: 'Phòng 3 giường đơn',
    description: 'Phòng 3 giường đơn cho nhóm bạn',
    totalRoomCount: 1,
    maxOccupancy: 3,
    privateBathroom: 'YES',
    basePrice: 550000,
    weekendPrice: 650000,
    beds: [{ bedType: 'SINGLE', quantity: 3 }]
  },
  {
    placeId: 24,
    placeName: 'Nhà nghỉ Ngủ',
    name: 'Phòng gia đình (2 giường đơn + 1 giường đôi)',
    description: 'Phòng gia đình không gian thoáng rộng',
    totalRoomCount: 2,
    maxOccupancy: 4,
    privateBathroom: 'YES',
    basePrice: 600000,
    weekendPrice: 750000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }, { bedType: 'SINGLE', quantity: 2 }]
  },
  // Hà Châu 2 Homestay (ID 26)
  {
    placeId: 26,
    placeName: 'Hà Châu 2 Homestay',
    name: 'Phòng đơn',
    description: 'Phòng đơn tiêu chuẩn view ruộng bậc thang',
    totalRoomCount: 6,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 400000,
    weekendPrice: 500000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  },
  {
    placeId: 26,
    placeName: 'Hà Châu 2 Homestay',
    name: 'Phòng VIP',
    description: 'Phòng VIP cao cấp view đẹp nhất homestay',
    totalRoomCount: 4,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 700000,
    weekendPrice: 850000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  },
  {
    placeId: 26,
    placeName: 'Hà Châu 2 Homestay',
    name: 'Nhà sàn tập thể',
    description: 'Khu nhà sàn truyền thống sức chứa lớn',
    totalRoomCount: 1,
    maxOccupancy: 25,
    privateBathroom: 'NO',
    basePrice: 150000,
    weekendPrice: 180000,
    beds: [{ bedType: 'FUTON', quantity: 25 }]
  },
  // Homestay Hiền Quang (ID 27)
  {
    placeId: 27,
    placeName: 'Homestay Hiền Quang',
    name: 'Phòng riêng nhà sàn (WC chung)',
    description: 'Sàn cộng đồng chia 5 phòng riêng biệt mộc mạc',
    totalRoomCount: 5,
    maxOccupancy: 2,
    privateBathroom: 'NO',
    basePrice: 300000,
    weekendPrice: 380000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  },
  {
    placeId: 27,
    placeName: 'Homestay Hiền Quang',
    name: 'Bungalow giường 2m',
    description: 'Căn bungalow riêng biệt với giường King 2m cực rộng',
    totalRoomCount: 1,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 700000,
    weekendPrice: 850000,
    beds: [{ bedType: 'KING', quantity: 1 }]
  },
  {
    placeId: 27,
    placeName: 'Homestay Hiền Quang',
    name: 'Bungalow 2 giường 1m6',
    description: 'Căn bungalow gia đình 2 giường đôi 1m6 khép kín',
    totalRoomCount: 1,
    maxOccupancy: 4,
    privateBathroom: 'YES',
    basePrice: 900000,
    weekendPrice: 1100000,
    beds: [{ bedType: 'QUEEN', quantity: 2 }]
  },
  // Homestay Hoà Thảo (ID 8)
  {
    placeId: 8,
    placeName: 'Homestay Hoà Thảo',
    name: 'Phòng cheap tiết kiệm',
    description: 'Phòng nghỉ nhỏ gọn, tiết kiệm chi phí cho dân phượt',
    totalRoomCount: 1,
    maxOccupancy: 2,
    privateBathroom: 'UNVERIFIED',
    basePrice: 350000,
    weekendPrice: 450000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  },
  {
    placeId: 8,
    placeName: 'Homestay Hoà Thảo',
    name: 'Phòng dorm (giường tầng/đệm)',
    description: 'Phòng dorm tập thể tiện lợi cho khách lẻ',
    totalRoomCount: 4,
    maxOccupancy: 1,
    privateBathroom: 'NO',
    basePrice: 150000,
    weekendPrice: 200000,
    beds: [{ bedType: 'SINGLE', quantity: 1 }]
  },
  // Trai Bản Homestay (ID 4)
  {
    placeId: 4,
    placeName: 'Trai Bản Homestay',
    name: 'Bungalow 3 giường',
    description: 'Bungalow gia đình 3 giường tiêu chuẩn giữa thiên nhiên',
    totalRoomCount: 2,
    maxOccupancy: 6,
    privateBathroom: 'YES',
    basePrice: 1400000,
    weekendPrice: 1800000,
    beds: [{ bedType: 'DOUBLE', quantity: 3 }]
  },
  {
    placeId: 4,
    placeName: 'Trai Bản Homestay',
    name: 'Phòng homestay truyền thống',
    description: 'Phòng phong cách mộc mạc đậm chất bản địa',
    totalRoomCount: 3,
    maxOccupancy: 2,
    privateBathroom: 'YES',
    basePrice: 450000,
    weekendPrice: 500000,
    beds: [{ bedType: 'DOUBLE', quantity: 1 }]
  }
];

async function runSync() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  console.log('=== STARTING HOMESTAY, ROOM AND IMAGE SYNCHRONIZATION ===');

  // STEP 1: UPLOAD IMAGES TO SUPABASE STORAGE
  console.log('\n--- Step 1: Uploading Images to Supabase Storage ---');
  const uploadResults: Array<{ filename: string; sha256: string; status: string; storageKey: string }> = [];

  for (const img of IMAGES_METADATA) {
    if (img.isDuplicate) {
      console.log(`[SKIP DUPLICATE] ${img.filename} is exact duplicate of ${img.duplicateOf}`);
      uploadResults.push({ filename: img.filename, sha256: img.sha256, status: 'SKIPPED_DUPLICATE', storageKey: img.storageKey });
      continue;
    }

    const fileBuffer = fs.readFileSync(img.localPath);
    console.log(`Uploading ${img.filename} (${img.sizeBytes} bytes) -> ${img.storageKey}`);

    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/viettrek-media/${img.storageKey}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
      },
      body: fileBuffer
    });

    if (uploadRes.ok) {
      console.log(`  -> SUCCESS: ${img.filename}`);
      uploadResults.push({ filename: img.filename, sha256: img.sha256, status: 'UPLOADED_SUCCESS', storageKey: img.storageKey });
    } else {
      const errText = await uploadRes.text();
      console.error(`  -> FAILED: ${img.filename} (${uploadRes.status}): ${errText}`);
      uploadResults.push({ filename: img.filename, sha256: img.sha256, status: 'ERROR: ' + errText, storageKey: img.storageKey });
    }
  }

  // STEP 2: INSERT MEDIA ASSETS AND PLACE_MEDIA IN POSTGRES
  console.log('\n--- Step 2: Synchronizing Media Records in PostgreSQL ---');
  const mediaRecordsInserted: any[] = [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const img of IMAGES_METADATA) {
      if (img.isDuplicate) continue;

      // Check if media_asset already exists by checksum
      let mediaId: number;
      const existCheck = await client.query('SELECT id FROM media_asset WHERE checksum_sha256 = $1', [img.sha256]);
      if (existCheck.rows.length > 0) {
        mediaId = parseInt(existCheck.rows[0].id, 10);
        console.log(`Media asset exists for ${img.filename}: id=${mediaId}`);
      } else {
        const insRes = await client.query(`
          INSERT INTO media_asset (storage_key, public_url, mime_type, width_px, height_px, size_bytes, checksum_sha256, alt_text, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now() AT TIME ZONE 'Asia/Ho_Chi_Minh')
          RETURNING id;
        `, [img.storageKey, img.publicUrl, 'image/jpeg', img.width, img.height, img.sizeBytes, img.sha256, img.caption]);
        mediaId = parseInt(insRes.rows[0].id, 10);
        console.log(`Inserted media_asset for ${img.filename}: id=${mediaId}`);
      }

      mediaRecordsInserted.push({ ...img, mediaId });

      // Link to place_media for Homestay Anh Túc (place_id = 1)
      const pmCheck = await client.query('SELECT 1 FROM place_media WHERE place_id = $1 AND media_id = $2', [1, mediaId]);
      if (pmCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO place_media (place_id, media_id, role, caption, sort_order)
          VALUES ($1, $2, $3, $4, $5);
        `, [1, mediaId, img.role, img.caption, mediaRecordsInserted.length]);
        console.log(`Linked to place_media: place_id=1, media_id=${mediaId}, role=${img.role}`);
      }
    }

    // Cover image is resolved via place_media role = 'COVER'
    console.log('Cover photo set via place_media with role = COVER');

    // STEP 3: INSERT NEW ROOM TYPES AND BEDS
    console.log('\n--- Step 3: Synchronizing Room Types and Beds ---');
    const addedRooms: any[] = [];
    const skippedRooms: any[] = [];

    for (const spec of NEW_ROOM_SPECS) {
      // Check if room type with similar name already exists for this place
      const existRoom = await client.query(`
        SELECT id, name, total_room_count FROM room_type 
        WHERE place_id = $1 AND (name ILIKE $2 OR name ILIKE $3);
      `, [spec.placeId, spec.name, `${spec.name}%`]);

      if (existRoom.rows.length > 0) {
        console.log(`[SKIP ROOM] Place ID ${spec.placeId} already has '${existRoom.rows[0].name}' (id=${existRoom.rows[0].id})`);
        skippedRooms.push({ spec, existing: existRoom.rows[0] });
        continue;
      }

      const insRoom = await client.query(`
        INSERT INTO room_type (place_id, name, description, max_occupancy, total_room_count, private_bathroom, base_price, weekend_price, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', now() AT TIME ZONE 'Asia/Ho_Chi_Minh', now() AT TIME ZONE 'Asia/Ho_Chi_Minh')
        RETURNING id;
      `, [spec.placeId, spec.name, spec.description, spec.maxOccupancy, spec.totalRoomCount, spec.privateBathroom, spec.basePrice, spec.weekendPrice]);

      const newRoomId = parseInt(insRoom.rows[0].id, 10);
      console.log(`[ADDED ROOM] Place ID ${spec.placeId} ('${spec.placeName}') -> Room '${spec.name}' (id=${newRoomId})`);

      // Add room beds
      for (const b of spec.beds) {
        await client.query(`
          INSERT INTO room_bed (room_type_id, bed_type, quantity)
          VALUES ($1, $2, $3);
        `, [newRoomId, b.bedType, b.quantity]);
      }
      addedRooms.push({ ...spec, newRoomId });
    }

    // Also populate beds for existing rooms where beds are missing
    console.log('\n--- Step 4: Populating Beds for Existing Rooms ---');
    const existingRoomsWithoutBeds = await client.query(`
      SELECT r.id, r.name, r.max_occupancy, r.total_room_count
      FROM room_type r
      LEFT JOIN room_bed b ON r.id = b.room_type_id
      WHERE b.id IS NULL;
    `);
    console.log(`Found ${existingRoomsWithoutBeds.rows.length} existing rooms without beds.`);
    let bedsAddedCount = 0;
    for (const r of existingRoomsWithoutBeds.rows) {
      const lower = r.name.toLowerCase();
      let bedType = 'DOUBLE';
      let qty = 1;
      if (lower.includes('đôi') || lower.includes('2 giường') || lower.includes('family')) {
        qty = 2;
      } else if (lower.includes('4 giường') || lower.includes('4 người')) {
        qty = lower.includes('4 giường') ? 4 : 2;
      } else if (lower.includes('3 giường') || lower.includes('3 người')) {
        qty = 3;
      } else if (lower.includes('sàn') || lower.includes('cộng đồng')) {
        bedType = 'FUTON';
        qty = r.max_occupancy || 10;
      } else if (lower.includes('đơn') || lower.includes('1 giường') || lower.includes('standard') || lower.includes('deluxe') || lower.includes('bungalow') || lower.includes('glamping')) {
        qty = 1;
      }
      await client.query(`
        INSERT INTO room_bed (room_type_id, bed_type, quantity)
        VALUES ($1, $2, $3);
      `, [r.id, bedType, qty]);
      bedsAddedCount++;
    }
    console.log(`Populated beds for ${bedsAddedCount} existing rooms.`);

    // STEP 5: LINK ROOM TYPE MEDIA FOR HOMESTAY ANH TUC
    console.log('\n--- Step 5: Linking Room Type Media for Homestay Anh Túc ---');
    const anhTucRooms = await client.query(`SELECT id, name FROM room_type WHERE place_id = 1;`);
    for (const imgRec of mediaRecordsInserted) {
      if (!imgRec.roomTypeKeyword) continue;
      const targetRoom = anhTucRooms.rows.find(r => r.name.toLowerCase().includes(imgRec.roomTypeKeyword));
      if (targetRoom) {
        const checkRtm = await client.query(`
          SELECT 1 FROM room_type_media WHERE room_type_id = $1 AND media_id = $2;
        `, [targetRoom.id, imgRec.mediaId]);
        if (checkRtm.rows.length === 0) {
          await client.query(`
            INSERT INTO room_type_media (room_type_id, media_id, role, caption, sort_order)
            VALUES ($1, $2, 'GALLERY', $3, 0);
          `, [targetRoom.id, imgRec.mediaId, imgRec.caption]);
          console.log(`Linked photo '${imgRec.filename}' to Room '${targetRoom.name}' (id=${targetRoom.id})`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('\n=== TRANSACTION COMMITTED SUCCESSFULLY! ===');

    // POST-SYNC AUDIT
    const finalCounts = {
      places: (await client.query("SELECT count(*) FROM place WHERE kind = 'HOMESTAY'")).rows[0].count,
      roomTypes: (await client.query("SELECT count(*) FROM room_type")).rows[0].count,
      roomBeds: (await client.query("SELECT count(*) FROM room_bed")).rows[0].count,
      mediaAssets: (await client.query("SELECT count(*) FROM media_asset")).rows[0].count,
      placeMedia: (await client.query("SELECT count(*) FROM place_media")).rows[0].count,
      roomTypeMedia: (await client.query("SELECT count(*) FROM room_type_media")).rows[0].count
    };

    console.log('\n--- Post-Sync Database Counts ---');
    console.log(JSON.stringify(finalCounts, null, 2));

    fs.writeFileSync('C:/Users/TUYEN/.gemini/antigravity/brain/1d733f9a-ea9c-43d4-b0db-c61bda9f7f93/scratch/sync_results.json', JSON.stringify({
      uploadResults,
      mediaRecordsInserted,
      addedRooms,
      skippedRooms,
      finalCounts
    }, null, 2), 'utf8');

  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('TRANSACTION ROLLED BACK DUE TO ERROR:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSync().catch(console.error);
