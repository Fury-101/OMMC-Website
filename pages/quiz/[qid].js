import Navbar from '../../components/Navbar.js'
import Registration from '../../components/Registration.js'
import Test from '../../components/Test.js'
import Footer from '../../components/Footer.js'
const fs = require("fs")
import { useState, useEffect } from 'react'
import XMLHttpRequest from 'xhr2'

export default ({ qid, err, pdf }) => {
    const [isSSR, setIsSSR] = useState(true)
    const [showQs, setShowQs] = useState(false)
    const [test, setTest] = useState({})

    useEffect(() => {
	    setIsSSR(false)
    }, [])

    if (err)
        return <>
            <div id = "screen" className='w-screen h-screen text-center'>
                <h1 className="text-center text-red-500 font-bold text-8xl"> An error has occurred. </h1>
                <p className="text-4xl">{err}</p>
            </div>
        </>
    
    let info = null;

    return <>
        <style global jsx>{`
            html,
            body,
            div#__next {
                height: 100vh;
            }
            .pdf {
                height: 66.666667vh;
            }
        `}</style>
        
        <Navbar/>

        <div id = "screen" className='w-full text-center bg-white'>
            <div className="border-4 border-solid border-gray-300 bg-slate-200 rounded-lg w-2/3 mx-auto my-8 py-1 px-2">
                <h1 className="text-center font-semibold text-4xl mb-2 text-red-700">Instructions:</h1>
                {qid.instructions?.map(i => 
                    <p className="text-center text-2xl">{i}</p>
                ) ?? <>
                    <p className="text-center text-2xl">just answer the questions lol</p>
                    <p className="text-center text-2xl">do yo best</p>
                </>}
            </div>
            <Registration state={showQs} setState={setShowQs} />
            {showQs && <Test qid={qid} isSSR={isSSR} pdf={pdf}/>}
        </div>

        <Footer/>
    </>
}

function base64Encode(str) {
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "", i = 0, len = str.length, c1, c2, c3;
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += CHARS.charAt(c3 & 0x3F);
    }
    return out;
} // <- haha look at this i am definitely not dying inside

function getBinary(file){
    return new Promise((res, rej) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", file, true);
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.onload = () => {
            res(xhr.responseText);
        }
        xhr.send();
    })
}

export async function getServerSideProps({ params }) {
    let test = null

    try {
        test = await fs.promises.readFile(`../tests/${params.qid}.json`)
        test = JSON.parse(test)

        let b64pdf = null;
        if (test?.pdf) {
            b64pdf = await getBinary(test.pdf)
            b64pdf = base64Encode(b64pdf)
        }

        return {
            props: {
                qid: test,
                pdf: b64pdf
            }
        }
    } catch (error) {
        return {
            props: {
                err: `${error}`
            }
        }
    }
}
