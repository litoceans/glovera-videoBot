// utils.ts
export const downloadModel = async (url: string): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error(`Failed to download model: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error while downloading model'));
        xhr.send();
    });
};

