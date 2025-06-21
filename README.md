
# Ứng dụng Ghi Chú - NoteLink

Đây là một ứng dụng Next.js, phục vụ như một ứng dụng ghi chú đơn giản có tên NoteLink.

Để sửa, hãy xem qua `src/app/page.tsx`.

Để cài đặt và chạy thử:
```bash
npm install
npm run dev
```

## Hướng dẫn Tích hợp Backend AWS Amplify v2 (Tiếng Việt)

Ứng dụng NoteLink này hiện tại đang sử dụng Local Storage (bộ nhớ cục bộ của trình duyệt) để lưu trữ dữ liệu ghi chú. Điều này có nghĩa là dữ liệu chỉ tồn tại trên máy của người dùng và sẽ mất nếu họ xóa cache trình duyệt hoặc sử dụng một trình duyệt khác. Để có một ứng dụng hoàn chỉnh, bền vững và có thể mở rộng, cần tích hợp một backend (hệ thống máy chủ) để quản lý và lưu trữ dữ liệu. Sau đây là hướng dẫn

### 1. Điều kiện tiên quyết
- Cài đặt và cấu hình [AWS Amplify CLI](https://docs.amplify.aws/cli/start/install/) trên máy.
- Một tài khoản AWS.

### 2. Khởi tạo Amplify trong dự án Next.js
Mở terminal trong thư mục gốc của dự án và chạy:
```bash
amplify init
```
Làm theo các hướng dẫn để cấu hình dự án Amplify của bạn (tên dự án, môi trường, trình soạn thảo mặc định, loại ứng dụng là `javascript` với framework `react` (Next.js được xây dựng trên React)).

### 3. Thêm API (GraphQL) và Cơ sở dữ liệu
Amplify sử dụng AWS AppSync cho API GraphQL và AWS DynamoDB làm cơ sở dữ liệu mặc định.

**a. Định nghĩa Schema Dữ liệu:**
Tạo hoặc chỉnh sửa file `amplify/backend/api/<YOUR_API_NAME>/schema.graphql`. Đây là nơi bạn định nghĩa mô hình dữ liệu cho `Note`.

Ví dụ về `schema.graphql` cho `Note`:
```graphql
type Note @model @auth(rules: [{ allow: public, operations: [read] }, { allow: owner }]) {
  id: ID!
  title: String!
  content: String!
  attachments: [NoteAttachment] @hasMany(indexName: "byNote", fields: ["id"])
  tags: [String]
  isPinned: Boolean
  color: String
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
  owner: String # Sẽ được Amplify tự động điền nếu sử dụng owner-based auth
}

type NoteAttachment @model(queries: null) @auth(rules: [{ allow: public, operations: [read] }, { allow: owner }]) {
  id: ID!
  name: String!
  type: String! # MIME type
  url: String # URL sau khi upload lên S3 (nếu dùng Amplify Storage)
  isImage: Boolean!
  noteId: ID! @index(name: "byNote", sortKeyFields: ["name"])
  note: Note @belongsTo(fields: ["noteId"])
}

# Hoặc một cách đơn giản hơn cho attachments nếu không cần quan hệ phức tạp và không cần @auth riêng cho Attachment:
# type Attachment {
#   id: ID! 
#   name: String!
#   type: String!
#   url: String
#   isImage: Boolean
# }
# Sau đó trong Note:
# attachments: [Attachment]
```
Trong ví dụ trên:
- `@model`: Chỉ thị cho Amplify tạo bảng DynamoDB và các resolver GraphQL tương ứng.
- `@auth`: Định nghĩa quy tắc xác thực. Ví dụ này cho phép đọc công khai và chủ sở hữu có toàn quyền (nếu bạn tích hợp Amplify Auth). Bạn có thể điều chỉnh quy tắc này theo nhu cầu (ví dụ: `[{ allow: public }]` cho phép mọi người đọc/ghi nếu không cần xác thực ban đầu hoặc `[{allow: private, provider: iam}]` nếu bạn muốn kiểm soát truy cập từ phía backend).
- `attachments: [NoteAttachment] @hasMany(...)`: Ví dụ về mối quan hệ một-nhiều nếu bạn muốn lưu attachments như một model riêng. Điều này cho phép quản lý `NoteAttachment` một cách độc lập và có thể có các quy tắc `@auth` riêng.
- `noteId: ID! @index(name: "byNote", sortKeyFields: ["name"])`: Tạo Global Secondary Index (GSI) để query `NoteAttachment` theo `noteId`.
- `owner: String`: Nếu bạn dùng `@auth(rules: [{ allow: owner }])`, trường này sẽ tự động được thêm và quản lý.
- `color: String`: Thêm trường màu cho Note.

**b. Đẩy cấu hình lên AWS:**
Sau khi định nghĩa schema, chạy lệnh:
```bash
amplify push
```
Amplify CLI sẽ hỏi bạn có muốn tạo code GraphQL (queries, mutations, subscriptions) không. Chọn `Yes` và chọn ngôn ngữ `typescript`.
Lệnh này sẽ tạo ra các tài nguyên backend trên AWS (bảng DynamoDB, API AppSync, v.v.).

### 4. Cấu hình Amplify trong ứng dụng Next.js
Sau khi `amplify push` thành công, một file `src/aws-exports.js` (hoặc `aws-exports.js` ở root, thường được tự động tạo trong `src` cho các dự án Next.js mới hơn) sẽ được tạo/cập nhật. Bạn cần cấu hình Amplify trong ứng dụng của mình.

Trong file `src/app/layout.tsx` (hoặc một file client-side chạy sớm, ví dụ `src/app/_components/ConfigureAmplify.tsx` để giữ `layout.tsx` là Server Component):
```typescript
// src/app/_components/ConfigureAmplify.tsx (Ví dụ)
"use client"; 

import { Amplify } from 'aws-amplify';
// Đảm bảo đường dẫn đến aws-exports.js là chính xác.
// Thường thì nó sẽ nằm ở thư mục gốc của dự án hoặc trong 'src'.
// Nếu bạn đã cấu hình alias trong tsconfig.json (ví dụ: "@/*": ["./src/*"]), 
// bạn có thể dùng '@/aws-exports' nếu aws-exports.js nằm trong src.
import awsExports from '../../aws-exports'; // Điều chỉnh đường dẫn nếu cần

Amplify.configure({ ...awsExports, ssr: true });

export default function ConfigureAmplify() {
  return null; // Component này chỉ dùng để cấu hình Amplify
}

// Sau đó import ConfigureAmplify vào src/app/layout.tsx
// import ConfigureAmplify from './_components/ConfigureAmplify';
// ...
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         <ConfigureAmplify />
//         {children}
//       </body>
//     </html>
//   );
// }
```
**Lưu ý:** File `aws-exports.js` thường được `.gitignore` tự động thêm vào, điều này là đúng vì nó chứa thông tin cấu hình backend của bạn.

Cài đặt các thư viện Amplify cần thiết:
```bash
npm install aws-amplify @aws-amplify/ui-react
# hoặc
yarn add aws-amplify @aws-amplify/ui-react
```

### 5. Thay thế Logic Local Storage bằng Lời gọi API Amplify
Bây giờ bạn sẽ cần cập nhật code trong `src/app/page.tsx` và các component liên quan (như `src/components/NoteEditorDialog.tsx`) để sử dụng API của Amplify. Amplify cung cấp thư viện DataStore (giúp làm việc offline và đồng bộ tự động) hoặc bạn có thể gọi trực tiếp GraphQL API.

Dưới đây là ví dụ sử dụng **API GraphQL trực tiếp**. File `src/graphql` sẽ chứa các queries, mutations, subscriptions được Amplify tạo ra.

**a. Đọc danh sách ghi chú (trong `src/app/page.tsx`):**
```typescript
import { API, graphqlOperation } from 'aws-amplify';
// Đường dẫn đến file queries của bạn có thể khác, ví dụ: import { listNotes } from '../graphql/queries';
import { listNotes } from '@/graphql/queries'; 
// Kiểu được Amplify tạo ra cũng cần import đúng đường dẫn
import type { ListNotesQuery, Note as GraphQLNote } from '@/API'; 
// ...

// Trong useEffect hoặc một hàm để fetch notes
useEffect(() => {
  const fetchNotesFromAmplify = async () => {
    // setIsLoading(true); // Bắt đầu loading, nếu bạn có state này
    try {
      // Ví dụ: chỉ lấy các trường cần thiết để giảm lượng dữ liệu tải về
      const statement = `
        query ListNotesCustom {
          listNotes {
            items {
              id
              title
              content
              tags
              isPinned
              color
              createdAt
              updatedAt
              attachments { # Nếu attachments là một model liên kết
                items {
                  id
                  name
                  type
                  url
                  isImage
                }
              }
              # owner # nếu bạn cần owner
            }
            # nextToken # nếu bạn muốn phân trang
          }
        }
      `;
      // const noteData = await API.graphql({ query: statement }) as { data: ListNotesQuery };
      // Hoặc sử dụng query đã được generate sẵn:
      const noteData = await API.graphql(graphqlOperation(listNotes)) as { data: ListNotesQuery };
      const fetchedNotes = noteData.data?.listNotes?.items || [];
      
      const formattedNotes: Note[] = fetchedNotes
        .filter(note => note != null) 
        .map((note) => ({ 
          id: note!.id,
          title: note!.title,
          content: note!.content,
          tags: note!.tags?.filter(tag => tag != null) as string[] || [],
          isPinned: note!.isPinned || false,
          color: note!.color || undefined,
          createdAt: note!.createdAt ? new Date(note!.createdAt) : new Date(),
          updatedAt: note!.updatedAt ? new Date(note!.updatedAt) : new Date(),
          attachments: note!.attachments?.items?.filter(att => att != null).map(att => ({ 
            id: att!.id,
            name: att!.name,
            type: att!.type,
            url: att!.url || undefined, // Đảm bảo url là string hoặc undefined
            isImage: att!.isImage,
            // file: undefined // file object không được lưu trữ trên backend
          })) || [],
        }));
      
      setNotes(formattedNotes);
      // toast({ title: "Ghi chú đã được tải từ Amplify!"}); // Bỏ toast mặc định này
    } catch (error) {
      console.error("Lỗi khi tải ghi chú từ Amplify:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách ghi chú từ server Amplify.",
        variant: "destructive",
      });
    } finally {
      // setIsLoading(false); // Kết thúc loading
    }
  };

  fetchNotesFromAmplify();
}, [toast]); // Thêm các dependencies cần thiết
```

**b. Tạo/Cập nhật ghi chú (trong `handleSaveNote` ở `src/app/page.tsx`):**
```typescript
// Đường dẫn có thể thay đổi
import { createNote, updateNote, createNoteAttachment, deleteNoteAttachment } from '@/graphql/mutations'; 
import type { CreateNoteInput, UpdateNoteInput, CreateNoteAttachmentInput } from '@/API';
// ...

const handleSaveNote = async (noteData: Note, attachmentsToUpload: AttachmentFile[]) => {
  const isEditing = !!noteToEdit; // Xác định đang edit hay tạo mới
  const now = new Date();

  // 1. Xử lý attachments
  let finalAttachmentIds: string[] = [];
  if (attachmentsToUpload.length > 0) {
    // Upload new files
    for (const fileObj of attachmentsToUpload) {
      if (fileObj.file) {
        try {
          const fileName = `${noteData.id || crypto.randomUUID()}/${crypto.randomUUID()}-${fileObj.file.name}`;
          const stored = await Storage.put(fileName, fileObj.file, {
            contentType: fileObj.file.type,
            // level: 'protected' or 'private' depending on your auth rules
          });
          // Tạo NoteAttachment record
          const attachmentInput: CreateNoteAttachmentInput = {
            id: crypto.randomUUID(), // Hoặc để Amplify tự sinh nếu không cần custom
            name: fileObj.file.name,
            type: fileObj.file.type,
            url: stored.key, // Lưu key của S3, không phải URL đầy đủ trừ khi bạn tạo URL có chữ ký
            isImage: fileObj.file.type.startsWith('image/'),
            noteId: noteData.id, // Sẽ gán sau khi note được tạo/update nếu cần
          };
          // Nếu noteId chưa có (đang tạo note mới), bạn cần tạo note trước, rồi mới tạo attachment
          // Hoặc, nếu schema cho phép, bạn có thể tạo attachment mà không cần noteId ban đầu và cập nhật sau
          // Trong trường hợp này, chúng ta giả sử noteId sẽ được set sau.
          // Cách tốt hơn: Nếu là note mới, tạo note trước, lấy id, rồi tạo attachment.
          // Hoặc, thiết kế schema cho phép tạo Note và NoteAttachments trong một mutation (nested create).
          // Hiện tại, schema @hasMany thường không hỗ trợ nested create trực tiếp dễ dàng.
          // Nên chúng ta sẽ tạo note, rồi tạo attachments.
          // Tạm thời, ta chỉ lưu S3 key và thông tin.
          // noteData.attachments sẽ cần được cập nhật với URL từ S3 key này.
          // Đây là phần phức tạp cần xử lý cẩn thận tùy theo luồng UX.

          // Giả sử chúng ta sẽ tạo/cập nhật NoteAttachment sau khi Note chính được tạo/cập nhật.
          // Trong ví dụ này, ta đơn giản hoá:
          noteData.attachments.push({
            id: attachmentInput.id!, // Giả định ID đã được tạo
            name: attachmentInput.name,
            type: attachmentInput.type,
            url: stored.key, // Lưu key trước
            isImage: attachmentInput.isImage,
            // file: undefined // Không lưu file object lên GraphQL
          });

        } catch (err) {
          console.error('Lỗi upload file:', err);
          toast({ title: "Lỗi Upload", description: `Không thể tải lên file ${fileObj.file.name}`, variant: "destructive"});
          return; // Dừng nếu upload lỗi
        }
      }
    }
  }
  
  // Xử lý attachments hiện có, so sánh với noteData.attachments để xem có file nào bị xóa không
  if (isEditing && noteToEdit && noteToEdit.attachments) {
    const existingAttachmentIds = noteData.attachments.map(att => att.id);
    const attachmentsToDelete = noteToEdit.attachments.filter(
      oldAtt => !existingAttachmentIds.includes(oldAtt.id)
    );
    for (const attToDelete of attachmentsToDelete) {
      try {
        if (attToDelete.url && !attToDelete.url.startsWith('data:')) { // Chỉ xóa file trên S3 nếu có URL thực sự
          await Storage.remove(attToDelete.url); // attToDelete.url ở đây là S3 key
        }
        // Xóa record NoteAttachment trong DynamoDB
        await API.graphql(graphqlOperation(deleteNoteAttachment, { input: { id: attToDelete.id } }));
      } catch (err) {
        console.error(`Lỗi khi xóa attachment ${attToDelete.name}:`, err);
        // Có thể không block, chỉ log lỗi
      }
    }
  }


  const noteInputGraphQL = {
    title: noteData.title,
    content: noteData.content,
    tags: noteData.tags,
    isPinned: noteData.isPinned,
    color: noteData.color,
    // attachments không trực tiếp gán vào NoteInput vì nó là một relation.
    // Chúng ta sẽ tạo/cập nhật NoteAttachments riêng biệt.
  };

  try {
    let savedNoteId = noteData.id;
    if (isEditing) {
      const updateInput: UpdateNoteInput = { id: noteData.id, ...noteInputGraphQL };
      await API.graphql(graphqlOperation(updateNote, { input: updateInput }));
      toast({ title: "Ghi chú đã cập nhật trên Amplify" });
    } else {
      // id sẽ được Amplify tự sinh nếu không cung cấp. Nếu bạn muốn dùng UUID từ client, đảm bảo schema cho phép.
      // const createInput: CreateNoteInput = { id: noteData.id, ...noteInputGraphQL }; // nếu bạn tự tạo ID
      const createInput: CreateNoteInput = noteInputGraphQL; // để Amplify tự tạo ID
      const result = await API.graphql(graphqlOperation(createNote, { input: createInput })) as { data: { createNote: { id: string } } };
      savedNoteId = result.data.createNote.id; // Lấy ID của note vừa tạo
      noteData.id = savedNoteId; // Cập nhật ID cho noteData cục bộ
      toast({ title: "Ghi chú đã tạo trên Amplify" });
    }

    // Sau khi Note được tạo/cập nhật, xử lý NoteAttachments
    // (Tạo mới các attachments đã upload, hoặc cập nhật nếu có logic đó)
    // Ví dụ: Tạo NoteAttachment cho các file mới được upload (nếu chưa có trong noteData.attachments từ S3)
    const currentAttachmentS3Keys = noteData.attachments.map(att => att.url).filter(Boolean) as string[];

    for (const att of noteData.attachments) {
        // Kiểm tra xem attachment này đã có trên S3 và đã có record NoteAttachment chưa.
        // Đây là một phần phức tạp hơn, cần logic để biết attachment nào là mới, cái nào là cũ.
        // Giả sử: nếu attachment có 'file' object, nó là mới hoặc được upload lại.
        // Nếu attachment không có 'file' nhưng url là S3 key, nó đã tồnस्थित.
        
        // Đơn giản hóa: Tạo record cho tất cả attachments trong noteData.attachments
        // mà chưa có (hoặc logic update nếu cần)
        // Cần đảm bảo noteId đúng.
        const attachmentGraphQLInput: CreateNoteAttachmentInput = {
            id: att.id, // ID của attachment
            name: att.name,
            type: att.type,
            url: att.url, // Đây là S3 key
            isImage: att.isImage,
            noteId: savedNoteId, // ID của Note cha
        };
        try {
            // Bạn có thể cần kiểm tra xem attachment này đã tồn tại chưa để quyết định create hay update.
            // Ví dụ này đơn giản là tạo mới.
            // Để tránh lỗi nếu attachment đã tồn tại, bạn có thể cần hàm `getNoteAttachment`
            // hoặc thiết kế mutation `createOrUpdateNoteAttachment`.
            // Tạm thời, chúng ta giả định rằng nếu nó nằm trong `noteData.attachments` thì nó nên được liên kết.
            // Nếu dùng @model cho NoteAttachment, nó có resolver riêng.
            // Có thể cần hàm updateNote để cập nhật list ID của attachments hoặc
            // từng attachment gọi createNoteAttachment / updateNoteAttachment.
            // Lược đồ hiện tại @hasMany sẽ tự động quản lý mối quan hệ nếu noteId được cung cấp đúng.
            // Chỉ cần tạo NoteAttachment là đủ.
            await API.graphql(graphqlOperation(createNoteAttachment, { input: attachmentGraphQLInput }));
        } catch (attachError) {
            console.error(`Error saving attachment ${att.name}: `, attachError);
            // Có thể toast lỗi cho từng attachment
        }
    }


    // Sau đó, bạn có thể fetch lại danh sách notes hoặc cập nhật state cục bộ
    // fetchNotesFromAmplify(); // Hoặc cách khác để cập nhật UI
    
    // Cập nhật state cục bộ để UI phản hồi ngay
    setNotes(prevNotes => {
      const existingNoteIndex = prevNotes.findIndex(n => n.id === noteData.id);
      let newNotesArray;
      if (existingNoteIndex > -1) {
        newNotesArray = [...prevNotes];
        // Cập nhật attachments với S3 keys (url)
        newNotesArray[existingNoteIndex] = { ...noteData, updatedAt: now }; 
      } else {
        newNotesArray = [{ ...noteData, createdAt: now, updatedAt: now }, ...prevNotes];
      }
      return newNotesArray.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });

    setIsEditorOpen(false);
    setNoteToEdit(null);
  } catch (error: any) {
    console.error("Lỗi khi lưu ghi chú lên Amplify:", error);
    const messages = error.errors ? error.errors.map((e: any) => e.message).join(', ') : error.message;
    toast({
      title: "Lỗi",
      description: `Không thể lưu ghi chú. ${messages || ''}`,
      variant: "destructive",
    });
  }
};
```

**c. Xóa ghi chú (trong `confirmDeleteNote` ở `src/app/page.tsx`):**
```typescript
import { deleteNote } from '@/graphql/mutations'; // Đường dẫn có thể thay đổi
// ...
const confirmDeleteNote = async () => {
  if (noteToDeleteId) {
    const noteBeingDeleted = notes.find(n => n.id === noteToDeleteId);
    try {
      // 1. Xóa các file attachments trên S3 (nếu có)
      if (noteBeingDeleted && noteBeingDeleted.attachments) {
        for (const att of noteBeingDeleted.attachments) {
          if (att.url && !att.url.startsWith('data:')) { // URL là S3 key
            try {
              await Storage.remove(att.url);
            } catch (s3Error) {
              console.warn(`Không thể xóa file ${att.url} từ S3:`, s3Error);
              // Có thể không block việc xóa note, chỉ log lỗi
            }
          }
          // 2. Xóa các record NoteAttachment trong DynamoDB
          //    Nếu schema của bạn dùng @hasMany với onUpdate: CASCADE, onDelete: CASCADE (Amplify hỗ trợ điều này không?)
          //    thì các NoteAttachment có thể tự động bị xóa.
          //    Nếu không, bạn cần xóa chúng một cách tường minh.
          //    Ví dụ này giả sử bạn cần xóa tường minh:
          try {
             await API.graphql(graphqlOperation(deleteNoteAttachment, { input: { id: att.id } }));
          } catch (dbError) {
             console.warn(`Không thể xóa NoteAttachment ${att.id} từ DB:`, dbError);
          }
        }
      }

      // 3. Xóa Note chính
      await API.graphql(graphqlOperation(deleteNote, { input: { id: noteToDeleteId } }));
      toast({ title: "Ghi chú đã được xóa trên Amplify" });
      
      // Cập nhật state cục bộ
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDeleteId));
      setNoteToDeleteId(null);
    } catch (error) {
      console.error("Lỗi khi xóa ghi chú trên Amplify:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa ghi chú.",
        variant: "destructive",
      });
    }
  }
  setIsDeleteDialogOpen(false);
};
```

**d. Xử lý file đính kèm với Amplify Storage (Chi tiết hơn):**
Như đã mô tả trong `handleSaveNote` và `confirmDeleteNote`.
Cần cài đặt Amplify Storage:
```bash
amplify add storage
# Chọn "Content (Images, audio, video, etc.)"
# Cung cấp tên bucket, chọn quyền truy cập (ví dụ: Auth and guest users)
# Cho authenticated users: CREATE/UPDATE, READ, DELETE
# Cho guest users: READ (nếu file là public)
# Hoặc thiết lập 'protected' level.
amplify push
```
Sau đó, sử dụng thư viện `Storage` của Amplify.

**Upload file (trong `NoteEditorDialog.tsx` hoặc `page.tsx`):**
File `AttachmentFile` trong `src/lib/types.ts` nên có `file?: File;` để giữ object File gốc.
```typescript
// Trong handleSaveNote, trước khi gọi API.graphql (đã tích hợp ở trên):
// ... phần upload file đã được thêm vào handleSaveNote ...

// Để hiển thị ảnh từ S3 (trong NoteCard hoặc ImagePreview):
// Cần một hàm để lấy URL có chữ ký nếu file không public.
// Hoặc nếu file public, S3 key có thể được ghép với URL của bucket.
// Ví dụ với Storage.get:
// const [imageSrc, setImageSrc] = useState<string | undefined>(attachment.url);
// useEffect(() => {
//   const fetchImageUrl = async () => {
//     if (attachment.url && !attachment.url.startsWith('http') && !attachment.url.startsWith('data:')) { // Giả sử url lưu key S3
//       try {
//         const signedUrl = await Storage.get(attachment.url, { 
//            level: 'public' // hoặc 'protected', 'private' tùy theo cấu hình storage của bạn
//            // expires: 3600 // Thời gian hết hạn của URL (giây)
//         }); 
//         setImageSrc(signedUrl as string);
//       } catch (error) {
//         console.error("Error fetching image from S3:", error);
//         // Có thể set ảnh placeholder nếu lỗi
//       }
//     } else {
//        setImageSrc(attachment.url); // Nếu url đã là URL đầy đủ hoặc data URI
//     }
//   };
//   if (attachment.isImage) {
//      fetchImageUrl();
//   }
// }, [attachment.url, attachment.isImage]);
// <Image src={imageSrc || 'placeholder.png'} ... />
```
Lưu ý: `Storage.get` trả về URL có chữ ký (signed URL) nếu file không public. URL này có thời gian hết hạn. Nếu file public, bạn có thể xây dựng URL trực tiếp.

### 6. Xác thực người dùng với Amplify Authenticator (Tùy chọn)
Nếu ứng dụng yêu cầu đăng nhập:
```bash
amplify add auth
# Chọn cấu hình mặc định hoặc tùy chỉnh theo nhu cầu (ví dụ: Email, Social login)
amplify push
```
Sau đó, bạn có thể sử dụng component `@aws-amplify/ui-react` để dễ dàng thêm luồng xác thực:
```typescript
// Ví dụ trong src/app/page.tsx (hoặc một component cha bao bọc Home)
// "use client"; // Cần thiết
// import { Authenticator, useAuthenticator,translations } from '@aws-amplify/ui-react';
// import { I18n } from 'aws-amplify/utils';
// import '@aws-amplify/ui-react/styles.css'; // Import CSS cho Authenticator

// I18n.putVocabulariesForLanguage('vi', {
//   'Sign In': 'Đăng Nhập',
//   'Sign Up': 'Đăng Ký',
//   // Thêm các bản dịch khác nếu cần
// });
// I18n.setLanguage('vi');


// export default function AppWithAuth() { // Component này sẽ là default export của page.tsx
//   return (
//     <Authenticator Varia translations={translations}> // Thêm translations nếu muốn Việt hóa
//       {({ signOut, user }) => (
//         // Truyền signOut và user vào Home component của bạn
//         <Home user={user} signOut={signOut} /> 
//       )}
//     </Authenticator>
//   );
// }

// function Home({ user, signOut }) { // Component Home của bạn (nội dung gốc của page.tsx)
//   // ... code của Home component ...
//   // Sử dụng `user` để lấy thông tin người dùng, `signOut` để đăng xuất
//   // Ví dụ: <p>Xin chào, {user?.username}</p> <Button onClick={signOut}>Đăng xuất</Button>
//   // Fetch notes nên được thực hiện sau khi user đã được xác thực, có thể dựa vào user.id
// }
```
Khi đó, trong `schema.graphql`, bạn có thể sử dụng các quy tắc `@auth` dựa trên `owner` (ví dụ `rules: [{ allow: owner }]`) để chỉ chủ sở hữu mới có quyền chỉnh sửa ghi chú của họ. Các mutation sẽ tự động gắn `owner` dựa trên người dùng đã đăng nhập. Các query `listNotes` cũng có thể được lọc theo `owner` nếu cần.

### 7. Chạy và Kiểm thử
Sau khi thực hiện các thay đổi, chạy ứng dụng Next.js của bạn (`npm run dev`) và kiểm tra xem các chức năng CRUD (Create, Read, Update, Delete) cho ghi chú có hoạt động với backend Amplify không. Theo dõi AWS AppSync console để xem các request GraphQL và DynamoDB console để xem dữ liệu, S3 console để xem file đã upload.

    