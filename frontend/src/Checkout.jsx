import SuperfluidWidget from "@superfluid-finance/widget";
import superTokenList from "@superfluid-finance/tokenlist";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import axios from "axios";

export default function Checkout({ ownerAddress, appName }) {
    const { address } = useAccount();


    const paymentOptions = [
        {
            receiverAddress: ownerAddress,
            superToken: {
                address: "0x671425Ae1f272Bc6F79beC3ed5C4b00e9c628240"
            },
            chainId: 42220,
            flowRate: {
                amountEther: "0.01",
                period: "month"
            }
        }
    ];
    const paymentDetails = {
        paymentOptions,
    };
    const productDetails = {
        name: appName,
        description: "This API Greets you",
        successURL: "http://localhost:5173/dashboard",
    };
    const handleButtonClick = () => {
        const wallet = address;
        axios.post("http://localhost:3000/buy", {
            appName,
            wallet,
        })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

    };
    return (
        <div className="p-4 border border-black ml-2">
            <ConnectButton.Custom onClick={handleButtonClick}>
                {({ openConnectModal, connectModalOpen }) => {
                    const walletManager = {
                        open: async () => openConnectModal(),
                        isOpen: connectModalOpen,
                    };
                    return (
                        <>
                            <SuperfluidWidget
                                productDetails={productDetails}
                                paymentDetails={paymentDetails}
                                tokenList={superTokenList}
                                type="drawer"
                                walletManager={walletManager}
                            >
                                {({ openModal }) => (
                                    <button onClick={() => {
                                        handleButtonClick();
                                        openModal();
                                    }}>Subscribe</button>
                                )}
                            </SuperfluidWidget>
                        </>
                    );
                }}
            </ConnectButton.Custom>
        </div>
    );
}






