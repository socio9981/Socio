import {useState} from "react";

export default function useConvertProfileImages() {

    const [updatedAccounts, setUpdatedAccounts] = useState([]);

    const convertToImage = (binaryData) => {
        const arrayBuffer = new Uint8Array(binaryData).buffer;
        const imageBlob = new Blob([arrayBuffer], {type: 'image/jpeg'});
        return (URL.createObjectURL(imageBlob));
    };

    const convertAccounts = (accounts) => {
        setUpdatedAccounts(accounts.map((account) => {
                const updatedAccount = {...account};
                updatedAccount[0].profilePicture = convertToImage(account[0].profilePicture);
                return updatedAccount;
        }));
    }

    return {updatedAccounts, convertAccounts};
}