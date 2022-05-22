import Navbar from "../../components/Navbar.js";
import Registration from "../../components/Registration.js";
import Test from "../../components/Test.js";
import Footer from "../../components/Footer.js";
const fs = require("fs");
import { useState, useEffect } from "react";
import XMLHttpRequest from "xhr2";

export default ({ qid, err, pdf }) => {
    const [isSSR, setIsSSR] = useState(true);
    const [showQs, setShowQs] = useState(false);
    const [teamInfo, setTeamInfo] = useState({});

    useEffect(() => {
        setIsSSR(false);
    }, []);

    const req = <span className="text-2xl text-red-600">*</span>;

    if (err)
        return (
            <>
                <div id="screen" className="w-screen h-screen text-center">
                    <h1 className="text-center text-red-500 font-bold text-8xl">
                        {" "}
                        An error has occurred.{" "}
                    </h1>
                    <p className="text-4xl">{err}</p>
                </div>
            </>
        );
    const $ = id => document.getElementById(id);

    const idToObj = id => Object.fromEntries(new FormData($(id)));

    function next() {
        const generalinfo = idToObj("general");
        if (!$("general").reportValidity())
            return

        const c1 = idToObj("c1-questions");
        if (!$("c1-questions").reportValidity())
            return

        const c2 = idToObj("c2-questions");
        let anyans = false;
        for (const data in c2) if (c2[data] !== "") anyans = true;

        if (anyans && !$("c2-questions").reportValidity())
            return

        const c3 = idToObj("c3-questions");
        anyans = false;
        for (const data in c3) if (c3[data] !== "") anyans = true;

        if (anyans && !$("c3-questions").reportValidity())
            return

        const c4 = idToObj("c4-questions");
        anyans = false;
        for (const data in c4) if (c4[data] !== "") anyans = true;

        if (anyans && !$("c4-questions").reportValidity())
            return

        setTeamInfo({
            ...generalinfo,
            c1,
            c2,
            c3,
            c4,
        });

        setShowQs(true);
    }

    function submit(ovrride) {
        if (isSSR) return;

        let unansPopup = document.getElementById("unanswered");
        let unanswered = false;
        const answers = [...document.querySelectorAll(".inputs")].map(e => {
            if (e.value === "") unanswered = true;
            return e.value.trim();
        });

        if (ovrride) unanswered = false;

        if (unanswered) {
            unansPopup.showModal(); //make them sad
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_URL}/api/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teamInfo,
                id: qid.id,
                answers,
            }),
        });

        location.href = "/success";
    }

    return (
        <>
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

            <Navbar />

            <div id="screen" className="w-full text-center bg-white">
                <div className="border-4 border-solid border-gray-300 bg-slate-200 rounded-lg w-2/3 mx-auto my-8 py-1 px-2">
                    <h1 className="text-center font-semibold text-4xl mb-2 text-red-700">
                        Instructions:
                    </h1>
                    {qid.instructions?.map(i => (
                        <p className="text-center text-2xl">{i}</p>
                    )) ?? (
                        <>
                            <p className="text-center text-2xl">
                                Answer the questions to the best of your
                                ability.
                            </p>
                        </>
                    )}
                </div>

                {!showQs && (
                    <>
                        <Registration state={showQs} setState={setShowQs} />
                             
                        <button
                            type="button"
                            onClick={() => next()}
                            className="drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 my-4 text-2xl transition duration-150"
                        >
                            Continue
                        </button>
                    </>
                )}

                {showQs && (
                    <>
                        <Test qid={qid} isSSR={isSSR} pdf={pdf} />

                        <dialog
                            className="border-4 border-solid border-gray-300 bg-white rounded-lg"
                            id="unanswered"
                        >
                            <p className="text-xl font-semibold">
                                Some questions have not been answered.
                            </p>
                            <form method="dialog">
                                <button
                                    className="ml-auto drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-sky-500 hover:bg-sky-600 my-4 text-2xl transition duration-150"
                                    value="cancel"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => submit(true)}
                                    className="ml-4 mr-auto drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 my-4 text-2xl transition duration-150"
                                >
                                    Submit Anyways
                                </button>
                            </form>
                        </dialog>
                        <button
                            onClick={() => submit(false)}
                            className="drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 my-4 text-2xl transition duration-150"
                        >
                            Submit
                        </button>
                    </>
                )}
            </div>

            <Footer />
        </>
    );
};

function base64Encode(str) {
    const CHARS =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "",
        i = 0,
        len = str.length,
        c1,
        c2,
        c3;
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
            out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
            out += CHARS.charAt((c2 & 0xf) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
        out += CHARS.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
        out += CHARS.charAt(c3 & 0x3f);
    }
    return out;
} // <- haha look at this i am definitely not dying inside

function getBinary(file) {
    return new Promise((res, rej) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", file, true);
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.onload = () => {
            res(xhr.responseText);
        };
        xhr.send();
    });
}

export async function getServerSideProps({ params }) {
    let test = null;

    try {
        test = await fs.promises.readFile(`../tests/${params.qid}.json`);
        test = JSON.parse(test);

        let b64pdf = null;
        if (test?.pdf) {
            b64pdf = await getBinary(test.pdf);
            b64pdf = base64Encode(b64pdf);
        }

        return {
            props: {
                qid: test,
                pdf: b64pdf,
            },
        };
    } catch (error) {
        return {
            props: {
                err: `${error}`,
            },
        };
    }
}
