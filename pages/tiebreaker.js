import Navbar from "../components/Navbar.js";
import Registration from "../components/Registration.js";
import Test from "../components/Test.js";
import Footer from "../components/Footer.js";
const fs = require("fs");
import { useState, useEffect } from "react";
import XMLHttpRequest from "xhr2";
import renderMathInElement from "katex/dist/contrib/auto-render.js";

export default function TestPage({ test, err, pdf }) {
    const [isSSR, setIsSSR] = useState(true);
    const [showQs, setShowQs] = useState(false);
    const [teamInfo, setTeamInfo] = useState({});
    const [timerText, setTimerText] = useState("00:00:00");
    const [timeStarted, setTimeStarted] = useState(0);

    const options = {
        //latex
        delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            {
                left: "\\begin{equation}",
                right: "\\end{equation}",
                display: true,
            },
            { left: "\\begin{align}", right: "\\end{align}", display: true },
            {
                left: "\\begin{alignat}",
                right: "\\end{alignat}",
                display: true,
            },
            { left: "\\begin{gather}", right: "\\end{gather}", display: true },
            { left: "\\begin{CD}", right: "\\end{CD}", display: true },
            { left: "\\[", right: "\\]", display: true },
        ],
    };

    useEffect(() => {
        setIsSSR(false);
    }, []);

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
        if (isSSR) return;
        const generalinfo = idToObj("general");
        if (!$("general").reportValidity()) return;

        const c1 = idToObj("c1-questions");
        if (!$("c1-questions").reportValidity()) return;

        const c2 = idToObj("c2-questions");
        let anyans = false;
        for (const data in c2) if (c2[data] !== "") anyans = true;

        if (anyans && !$("c2-questions").reportValidity()) return;

        const c3 = idToObj("c3-questions");
        anyans = false;
        for (const data in c3) if (c3[data] !== "") anyans = true;

        if (anyans && !$("c3-questions").reportValidity()) return;

        const c4 = idToObj("c4-questions");
        anyans = false;
        for (const data in c4) if (c4[data] !== "") anyans = true;

        if (anyans && !$("c4-questions").reportValidity()) return;

        setTeamInfo({
            ...generalinfo,
            c1,
            c2,
            c3,
            c4,
        });

        if (typeof $("ready").showModal === "function")
            return $("ready").showModal();

        continueFunc();
    }

    function continueFunc() {
        setShowQs(true);
        !isSSR && window.scrollTo(0, 0);

        fetch(`/api/startTB`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teamname: teamInfo["team-name"],
                timeStarted: Date.now(),
            }),
            mode: "cors",
        }).then(response => {
            if (response.status === 200) {
                return response.json();
            } else
                alert(
                    `Error code ${response.status}:${response.statusText}\nPlease write down your answers.`
                );
        }).then(data => {
            let startTime;
            if (data.time) {
                setTimeStarted(data.time);
                startTime = data.time;
            } else {
                setTimeStarted(Date.now());
                startTime = Date.now();
            }
            console.log(startTime);
            console.log(timeStarted);
            console.log(data);
            function updateTimer() {
                const diff = Date.now() - startTime;
    
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
                setTimerText(
                    `${hours.toString().padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                );
    
                setTimeout(updateTimer, 1000);
            }
            updateTimer();
        })
    }

    function submit(ovrride) {
        if (isSSR) return;

        let unansPopup = $("unanswered");
        let unanswered = false;
        const answers = [...document.querySelectorAll(".inputs")].map(e => {
            if (e.value === "") unanswered = true;
            return e.value.trim();
        });

        if (ovrride) unanswered = false;

        if (unanswered) {
            if (typeof unansPopup.showModal !== "function") {
                unansPopup.hidden = true;
                return;
            }
            unansPopup.showModal();
            return;
        }

        console.log({
            teamInfo,
            id: "tiebreaker",
            answers,
        });

        fetch(`/api/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teamInfo,
                id: "tiebreaker",
                time: {
                    timeStarted,
                    timeEnded: Date.now(),
                },
                answers,
            }),
            mode: "cors",
        }).then(response => {
            if (response.status === 200) location.href = "/success";
            else
                alert(
                    "Error code " +
                        response.status +
                        ": " +
                        response.statusText +
                        "\n" +
                        "Please write down your answers."
                );
        });
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
                .katex {
                    font-size: 1.1em;
                }
                .mx-1\/4 {
                    margin-left: 12.5vw;
                    margin-right: 12.5vw;
                }
                .mx-1\/6 {
                    margin-left: 16.666667vw;
                    margin-right: 16.666667vw;
                }
                .min-w-3\/4 {
                    min-width: 75vw;
                }
            `}</style>

            <Navbar />

            {showQs && (
                <div
                    id="timercontainer"
                    className="border-4 border-solid border-gray-400 bg-slate-300 rounded-lg z-10 text-center fixed top-8 left-8 px-6 py-4"
                >
                    <span
                        id="timertext"
                        className="text-center text-red-700 text-3xl"
                    >
                        {timerText}
                    </span>
                </div>
            )}

            <div id="screen" className="w-full bg-white text-center">
                <div className="border-4 border-solid border-gray-300 bg-slate-200 rounded-lg mx-1/4 my-8 py-1 px-2">
                    <h1 className="text-center font-semibold text-4xl mb-2 text-red-700">
                        Instructions:
                    </h1>
                    {test.instructions?.map((e, i) => (
                        <p
                            className="text-2xl my-4"
                            id={`instructions-${e}`}
                            key={i}
                            ref={node => {
                                node && renderMathInElement(node, options);
                            }}
                        >
                            {e}
                        </p>
                    )) ?? (
                        <>
                            <p className="text-center text-2xl" key={i}>
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
                            className="drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative text-center rounded-full py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 my-4 text-2xl transition duration-150"
                        >
                            Continue to Questions
                        </button>

                        <dialog
                            className="border-4 border-solid border-gray-300 bg-white rounded-lg"
                            id="ready"
                        >
                            <p className="text-xl font-semibold">
                                Are you sure you want to begin the test? The
                                timer will start and you will not be able to go
                                back to the registration page.
                            </p>
                            <form method="dialog">
                                <button
                                    className="ml-auto drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-sky-500 hover:bg-sky-600 my-4 text-2xl transition duration-150"
                                    value="cancel"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => continueFunc()}
                                    className="ml-4 mr-auto drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 my-4 text-2xl transition duration-150"
                                >
                                    Begin
                                </button>
                            </form>
                        </dialog>
                    </>
                )}

                {showQs && (
                    <>
                        <Test test={test} isSSR={isSSR} pdf={pdf} />

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
}

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

export async function getServerSideProps() {
    let test = null;

    try {
        test = await fs.promises.readFile(`../tests/tiebreaker.json`);
        test = JSON.parse(test);

        let b64pdf = null;
        if (test?.pdf) {
            b64pdf = await getBinary(test.pdf);
            b64pdf = base64Encode(b64pdf);
        }

        return {
            props: {
                test: test,
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
