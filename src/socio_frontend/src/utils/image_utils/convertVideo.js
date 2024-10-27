export function convertVideoToBinary(video) {
    return new Promise((resolve, reject) => {
        if (!(video instanceof File || video instanceof Blob)) {
            reject(new Error("Input must be a File or Blob"));
            return;
        };

        const reader = new FileReader();
        reader.onload = function (event) {
            const arrayBuffer = event.target.result;
            const uint8Array = new Uint8Array(arrayBuffer);
            resolve(uint8Array);
        };
        reader.onerror = function (error) {
            reject(error);
        };
        reader.readAsArrayBuffer(video);
    });
};

export function convertToVideo(binary) {
    const content = new Uint8Array(binary);
    return URL.createObjectURL(
        new Blob([content.buffer], { type: 'video/mp4' }) // Update MIME type as needed
    );
};

export async function convertVideoToHash(binary) {
    try {
        // Ensure binary is an ArrayBuffer if it's a TypedArray (like Uint8Array)
        const buffer = binary instanceof ArrayBuffer ? binary : binary.buffer;

        const hashBuffer = await window.crypto.subtle.digest(
            { name: "SHA-256" },
            buffer
        );

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        console.log("SHA-256 hash:", hashString);
        return hashString;
    } catch (error) {
        console.error("Error calculating hash:", error);
        return null; // Handle the error appropriately in your code
    };
};
