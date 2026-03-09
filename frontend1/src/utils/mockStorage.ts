const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockStorage = {
    getItems: async <T>(key: string): Promise<T[]> => {
        await delay(500);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    createItem: async <T extends { _id?: string }>(key: string, item: T): Promise<T> => {
        await delay(500);
        const items = await mockStorage.getItems<T>(key);
        const newItem = { ...item, _id: Math.random().toString(36).substr(2, 9) };
        items.push(newItem);
        localStorage.setItem(key, JSON.stringify(items));
        return newItem;
    },

    updateItem: async <T extends { _id: string }>(key: string, id: string, updates: Partial<T>): Promise<T> => {
        await delay(500);
        const items = await mockStorage.getItems<T>(key);
        const index = items.findIndex((item) => item._id === id);
        if (index === -1) throw new Error("Item not found");

        // Merge existing item with updates
        const updatedItem = { ...items[index], ...updates };
        items[index] = updatedItem;

        localStorage.setItem(key, JSON.stringify(items));
        return updatedItem;
    },

    deleteItem: async <T extends { _id: string }>(key: string, id: string): Promise<void> => {
        await delay(500);
        const items = await mockStorage.getItems<T>(key);
        const filteredItems = items.filter((item) => item._id !== id);
        localStorage.setItem(key, JSON.stringify(filteredItems));
    },

    clearItems: async (key: string): Promise<void> => {
        await delay(500);
        localStorage.removeItem(key);
    },
};
