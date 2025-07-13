# Ứng dụng Ghi Chú - NoteLink

Đây là một ứng dụng Next.js, phục vụ như một ứng dụng ghi chú đơn giản có tên NoteLink.

**Lưu ý**
Mọi code ở đây có thể đọc hiểu để tham khảo, nếu có bất cứ lỗi gì khi triển khai thực tế, người phát triển cần xem tình hình thực tế để fix lỗi.
Người làm ra ứng dụng này xem như đã cho bài giải, chỉ việc tham khảo và ứng dụng vào thực tế. Mọi hướng dẫn đã có trong readme!

## Thay đổi so với bản 1

- Tích hợp AWS vào code, chỉ việc cấu hình như hướng dẫn rồi chạy.
- Thay đổi hướng dẫn thành amplify gen 2.
- Tích hợp xem Note qua share link, phân quyền dạng public.
- Thay đổi cấu trúc database cho phù hợp và tương thích với Dynamo.
- Thay đổi logic lấy thông tin file upload.

## Chạy Ứng Dụng

Ứng dụng này có thể hoạt động ở hai chế độ:
1.  **`local`**: Dữ liệu được lưu vào Local Storage của trình duyệt. Đây là chế độ mặc định, phù hợp để phát triển và thử nghiệm nhanh giao diện người dùng.
2.  **`amplify`**: Dữ liệu được lưu trên backend AWS Amplify.

Để chọn chế độ, tạo một file tên là `.env.local` ở thư mục gốc của dự án và thêm vào dòng sau:

```env
NEXT_PUBLIC_DATA_SOURCE=local
# hoặc
# NEXT_PUBLIC_DATA_SOURCE=amplify
```

Nếu không có file `.env.local` hoặc biến môi trường này không được đặt, ứng dụng sẽ mặc định chạy ở chế độ `local`.

Sau đó, cài đặt các gói và chạy server phát triển:
```bash
npm install
npm run dev
```

---

## Hướng Dẫn Tích Hợp Backend AWS Amplify Gen 2

Để kích hoạt chế độ `amplify` và xây dựng một ứng dụng hoàn chỉnh, cần tích hợp một backend.

### 1. Điều Kiện Tiên Quyết
- [Cài đặt Node.js và npm](https://nodejs.org/en).
- Một [tài khoản AWS](https://aws.amazon.com/free/).

### 2. Cài Đặt và Khởi Tạo Amplify Trong Dự Án
Trong thư mục gốc của dự án, chạy lệnh sau để bắt đầu quá trình cài đặt Amplify vào dự án:
```bash
npm create amplify@latest
```
Lệnh này sẽ cài đặt các gói cần thiết (`@aws-amplify/backend`, `@aws-amplify/backend-cli`) và tạo ra cấu trúc thư mục `amplify/` trong dự án.

### 3. Phát Triển Cục Bộ với Sandbox
Sau khi cài đặt, khởi động môi trường sandbox để phát triển cục bộ. Sandbox sẽ theo dõi các thay đổi trong thư mục `amplify/` và tự động cung cấp tài nguyên trên AWS.
```bash
npx amplify sandbox
```
Khi chạy lần đầu, bạn sẽ được yêu cầu đăng nhập vào AWS. Sandbox sẽ tạo ra file `amplifyconfiguration.json` ở thư mục gốc, file này chứa thông tin cấu hình để kết nối frontend với backend.

### 4. Định Nghĩa Backend Bằng TypeScript
Với Amplify Gen 2, định nghĩa tất cả tài nguyên backend (xác thực, cơ sở dữ liệu, lưu trữ, v.v.) bằng TypeScript ngay trong thư mục `amplify/`.

**a. Xác thực người dùng (Auth):**
Tạo file `amplify/auth/resource.ts` và định nghĩa quy tắc xác thực. Ví dụ, sử dụng email làm phương thức đăng nhập, giữ nguyên nếu dự án đã tích hợp nhiều hơn:
```typescript
// amplify/auth/resource.ts
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
```

**b. Cơ sở dữ liệu và API (Data):**
Tạo file `amplify/data/resource.ts`. Đây là nơi định nghĩa mô hình dữ liệu cho `Note`.
```typescript
// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Note: a
    .model({
      title: a.string().required(),
      content: a.string().required(),
      tags: a.string().array(),
      isPinned: a.boolean(),
      color: a.string(),
      attachments: a.string().array(), // Lưu trữ dưới dạng mảng các S3 path
    })
    .authorization(allow => [
      // Chỉ chủ sở hữu ghi chú mới có thể tạo, cập nhật hoặc xóa nó.
      allow.owner(),
      // Bất kỳ ai có liên kết đều có thể xem ghi chú (chỉ đọc).
      // Quy tắc này sử dụng phân quyền IAM, phù hợp cho việc render phía server (SSR)
      // trong trang Next.js.
      allow.public('iam').to(['read'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // Bật chế độ phân quyền IAM để cho phép truy cập đọc công khai
    // cho trang chia sẻ ghi chú.
    iamAuthorizationMode: 'enabled',
  },
});
```

**c. Lưu trữ file (Storage):**
Để xử lý việc tải lên các tệp đính kèm, bạn cần định nghĩa một tài nguyên lưu trữ (sử dụng Amazon S3). Tạo file `amplify/storage/resource.ts`:
```typescript
// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'notelink-storage',
  access: (allow) => ({
    'protected/{user_identity_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'protected/*': [
      allow.guest.to(['read'])
    ]
  })
});
```
Cấu hình này tạo ra một thư mục `protected` trong S3 bucket. Mỗi người dùng đã xác thực sẽ có một thư mục con riêng (dựa trên `user_identity_id` của họ) và chỉ họ mới có quyền đọc, ghi, và xóa các tệp trong đó. Đồng thời, nó cho phép tất cả mọi người (kể cả người dùng chưa đăng nhập) có quyền đọc các tệp này, điều này là cần thiết để các liên kết chia sẻ có thể hiển thị các tệp đính kèm.

**d. Cấu hình Backend Hoàn Chỉnh:**
Bây giờ, hãy kết hợp tất cả các tài nguyên đã định nghĩa trong file `amplify/backend.ts`, **giữ nguyên nếu đã có cấu hình rồi**:
```typescript
// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

defineBackend({
  auth,
  data,
  storage,
});
```
Sau khi lưu các file này, `amplify sandbox` sẽ tự động triển khai chúng lên môi trường cloud của bạn. Logic trong `src/lib/note-service.ts` đã được viết để tự động sử dụng các tài nguyên này khi chế độ `amplify` được kích hoạt.

### 5. Cấu Hình Amplify Trong Ứng Dụng Next.js
Ứng dụng đã được cấu hình sẵn để sử dụng Amplify khi `NEXT_PUBLIC_DATA_SOURCE` được đặt thành `amplify`. File `src/components/ConfigureAmplify.tsx` sẽ tự động được kích hoạt để cấu hình thư viện Amplify ở phía client.

Để yêu cầu người dùng đăng nhập, bạn có thể sử dụng `withAuthenticator` HOC của Amplify. Mở file `src/app/page.tsx` và bọc component `Home` của bạn. Logic này đã được viết sẵn nhưng bạn có thể cần kích hoạt nó nếu bạn đã thay đổi file này.

Khi người dùng đăng nhập và chế độ `amplify` được bật, dịch vụ `note-service` sẽ tự động tải tệp lên S3 và lưu các ghi chú vào DynamoDB.

### 6. Triển Khai (Deploy) Backend
Khi bạn đã sẵn sàng để triển khai backend lên một môi trường cố định (staging/production), chạy lệnh:
```bash
npx amplify deploy
```

### Ký tên
DEV HỌ LÀO - LÀO GÌ CŨNG TÔN
Còn gì mà chưa làm nữa đâu! Thêm con AI vào kêu nó tạo cái note bằng giọng nói luôn đi cho khác biệt!