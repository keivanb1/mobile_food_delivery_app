import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[]; // list of customization names
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  console.log(`Clearing collection: ${collectionId}`);
  const list = await databases.listDocuments(
    appwriteConfig.databaseId,
    collectionId,
  );

  // به جای Promise.all از for-of استفاده می‌کنیم تا یکی یکی حذف کند و خطا ندهد
  for (const doc of list.documents) {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        collectionId,
        doc.$id,
      );
    } catch (e) {
      console.log(`Skip deleting ${doc.$id}: already gone`);
    }
  }
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId);

  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id),
    ),
  );
}

async function uploadImageToStorage(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // ساخت یک فایل آبجکت سازگار با React Native
    const fileObj = {
      name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
      type: blob.type,
      size: blob.size,
      uri: imageUrl,
    };

    const file = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      fileObj,
    );

    return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
  } catch (error) {
    console.error("Image upload failed:", imageUrl, error);
    return ""; // بازگشت استرینگ خالی در صورت خطا
  }
}

async function seed(): Promise<void> {
  try {
    console.log("🚀 START SEEDING...");

    // 1. Clear all (ترتیبی برای جلوگیری از تداخل)
    await clearAll(appwriteConfig.categoriesCollectionId);
    await clearAll(appwriteConfig.customizationsCollectionId);
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.menuCustomizationsCollectionId);

    // 2. Create Categories
    console.log("📦 Creating Categories...");
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        ID.unique(),
        cat,
      );
      categoryMap[cat.name] = doc.$id;
    }

    // 3. Create Customizations
    console.log("🛠 Creating Customizations...");
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.customizationsCollectionId,
        ID.unique(),
        {
          name: cus.name,
          price: cus.price,
          type: cus.type,
        },
      );
      customizationMap[cus.name] = doc.$id;
    }

    // 4. Create Menu Items
    console.log("🍔 Creating Menu Items & Uploading Images...");
    for (const item of data.menu) {
      // آپلود تصویر (یکی یکی برای جلوگیری از Network Request Failed)
      const uploadedImage = await uploadImageToStorage(item.image_url);

      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCollectionId,
        ID.unique(),
        {
          name: item.name,
          description: item.description,
          image_url: uploadedImage.toString(), // تبدیل به string
          price: item.price,
          rating: item.rating,
          calories: item.calories,
          protein: item.protein,
          // توجه: اگر در Appwrite این فیلد Relationship است، باید ID بفرستید
          categories: categoryMap[item.category_name],
        },
      );

      // 5. Create menu_customizations (ارتباط چند به چند)
      for (const cusName of item.customizations) {
        if (customizationMap[cusName]) {
          await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCustomizationsCollectionId,
            ID.unique(),
            {
              menu: doc.$id,
              customizations: customizationMap[cusName],
            },
          );
        }
      }
      console.log(`✅ Created: ${item.name}`);
    }

    console.log("✨ ALL DONE! Seeding complete.");
  } catch (error) {
    console.error("❌ SEED ERROR:", error);
    throw error;
  }
}

export default seed;
