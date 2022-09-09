import { FC, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";

interface ConnectOpts {
    onlyIfTrusted: boolean;
}

interface phantomProvider {
    connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
    disconnect: ()=>Promise<void>;
    on: (event: PhantomEvent, callback: (args:any)=>void) => void;
    isPhantom: boolean;
}

type WindowWithSolana = Window & { 
    solana?: phantomProvider;
}

const Connect2Wallet: FC = () => {

    const [ walletAvail, setWalletAvail ] = useState(false);
    const [ phantomProvider, setphantomProvider ] = useState<phantomProvider | null>(null);
    const [ connected, setConnected ] = useState(false);
    const [ pubKey, setPubKey ] = useState<PublicKey | null>(null);


    useEffect( ()=>{
        if ("solana" in window) {
            const solWindow = window as WindowWithSolana;
            if (solWindow?.solana?.isPhantom) {
                setphantomProvider(solWindow.solana);
                setWalletAvail(true);
                /** only if trusted Attempt an eager connection */ 
                solWindow.solana.connect({ onlyIfTrusted: true });
            }
        }
    }, []);

    useEffect( () => {
        phantomProvider?.on("connect", (publicKey: PublicKey)=>{ 
            console.log(`connect event: ${publicKey}`);
            setConnected(true); 
            setPubKey(publicKey);
        });
        phantomProvider?.on("disconnect", ()=>{ 
            console.log("disconnect event");
            setConnected(false); 
            setPubKey(null);
        });

    }, [phantomProvider]);


    const connectHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        console.log("connect handler",event);
        phantomProvider?.connect().catch((err) => { console.error("connect ERROR:", err); });
    }

    const disconnectHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        console.log("disconnect handler");
        phantomProvider?.disconnect()
        .catch((err) => {console.error("disconnect ERROR:", err); });
    }

    return (
        <div>
            { walletAvail ?
                <>
                <button disabled={connected} onClick={connectHandler}>Connect to Phantom wallet</button>
                <button disabled={!connected} onClick={disconnectHandler}>Disconnect from Phantom wallet</button>
                { connected ? <p>Your public key is : {pubKey?.toBase58()}</p> : null }
                </>:
                <>
                <p>Opps!!!!!!! Phantom wallet is not available. Go get it <a href="https://phantom.app/">https://phantom.app/</a>.</p>
                </>
            }
        </div>
    );
}

export default Connect2Wallet;
