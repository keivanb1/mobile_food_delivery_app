import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import {
  Account,
  AppwriteException,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: "com.keyvan.realstate",
  databaseId: "6a51220c003256e1fc0b",
  bucketId: "6a54abca0004fc901daf",
  userCollectionId: "8753097894",
  categoriesCollectionId: "8743907846",
  menuCollectionId: "4444444444",
  customizationsCollectionId: "9999999999",
  menuCustomizationsCollectionId: "2222222222",
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setPlatform(appwriteConfig.platform)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

export const logout = async (): Promise<void> => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 401) {
      return;
    }

    throw error instanceof Error
      ? error
      : new Error("An unknown logout error occurred");
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    await logout();
    return await account.createEmailPasswordSession(email, password);
  } catch (error) {
    console.log("signIn error:", error);

    if (error instanceof AppwriteException) {
      throw new Error(error.message);
    }

    throw error instanceof Error ? error : new Error("Unknown error");
  }
};

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    await logout();

    const newAccount = await account.create(ID.unique(), email, password, name);

    if (!newAccount) {
      throw new Error("Failed to create account");
    }

    await account.createEmailPasswordSession(email, password);

    const avatarUrl = avatars.getInitialsURL(name).toString();

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        name,
        avatar: avatarUrl,
      },
    );
  } catch (error) {
    console.log("createUser error:", error);

    if (error instanceof AppwriteException) {
      throw new Error(error.message);
    }

    throw error instanceof Error ? error : new Error("Unknown error");
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) return null;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)],
    );

    if (currentUser.total === 0) return null;

    return currentUser.documents[0];
  } catch {
    return null;
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];
    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries,
    );
    return menus.documents;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
    );
    return categories.documents;
  } catch (error) {
    throw new Error(error as string);
  }
};
