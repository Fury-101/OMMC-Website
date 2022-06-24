const XMLHttpRequest = require("xhr2");
const fs = require("fs");
import { useState, useEffect } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render.js";
import { useSession, signIn, signOut } from "next-auth/react";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const authUsers = [
    "709824734665375928", //evan
    "308343641598984203", //fury
];

export default function Answers({ data, test, err, pdf }) {
    const [isSSR, setIsSSR] = useState(true);
    const [mode, setMode] = useState("table");
    const [open, setOpen] = useState(false);
    const { data: session, status } = useSession();
    console.log(session, status);

    useEffect(() => {
        setIsSSR(false);
    }, []);

    function $(inp) {
        if (!isSSR) return document.querySelector(inp);
    }

    function formatMS(ms) {
        const date = new Date(ms);
        
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
    }

    function formatDiff(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    const ans = data.map(e => e.answers);

    let totalFreq = ans[0].map((e, i) => frequency(i));

    function frequency(i) {
        let freqAns = new Map();
        if (!isSSR) {
            for (let a of ans) {
                freqAns.set(a[i], (freqAns.get(a[i]) ?? 0) + 1);
            }
        }
        freqAns = [...freqAns].sort((a, b) => b[1] - a[1]);
        return freqAns;
    }

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

    if (!isSSR)
        window.WebFontConfig = {
            // more latex
            custom: {
                families: [
                    "KaTeX_AMS",
                    "KaTeX_Caligraphic:n4,n7",
                    "KaTeX_Fraktur:n4,n7",
                    "KaTeX_Main:n4,n7,i4,i7",
                    "KaTeX_Math:i4,i7",
                    "KaTeX_Script",
                    "KaTeX_SansSerif:n4,n7,i4",
                    "KaTeX_Size1",
                    "KaTeX_Size2",
                    "KaTeX_Size3",
                    "KaTeX_Size4",
                    "KaTeX_Typewriter",
                ],
            },
        };

    function Attachment(s) {
        if (s.attached?.type === `image`) {
            return <img src={s.attached?.src} className="mx-auto" />;
        }
    }

    function gender(g) {
        if (g.toLowerCase() === "male")
            return (
                <img src="/Male_Icon.svg" className="w-5 h-5 inline-block" />
            );
        if (g.toLowerCase() === "female")
            return (
                <img src="/Female_Icon.svg" className="w-5 h-5 inline-block" />
            );
        return <span className="w-5 h-5 inline-block text-center"></span>;
    }

    function openQuestion(s, i) {
        $(`#res-${i}`).classList.toggle("absolute");
        $(`#res-${i}`).classList.toggle("hidden");
    }

    function menu() {
        if (isSSR) return;

        if (!open) console.log("Opened menu");
        else console.log("Closed menu");

        setOpen(!open);
        $("#menu").classList.toggle("open");
        $("#menu").classList.toggle("closed");
        $("#menubtn").classList.toggle("normal");
        $("#menubtn").classList.toggle("extended");
        $("#menusvg").classList.toggle("hidden");
        $("#closesvg").classList.toggle("hidden");
    }

    if (status === "loading") return null;

    if (!session && !isSSR)
        return (
            <>
                <span>
                    Hey! To see answers you must sign into your Discord account.
                    <br />
                </span>
                <button onClick={() => signIn()}>Sign in</button>
            </>
        );
    else if (!authUsers.includes(session?.id) && session?.id !== test.creator)
        return (
            <>
                <span>
                    Hey, you didn&apos;t create this test.
                    <br />
                </span>
                <button onClick={() => signOut()}>Sign out</button>
            </>
        );

    if (err)
        return (
            <>
                <style global jsx>{`
                    html,
                    body,
                    div#__next {
                        height: 100vh;
                    }
                `}</style>

                <div id="screen" className="w-screen h-screen text-center">
                    <h1 className="text-center text-red-500 font-bold text-8xl">
                        An error has occurred.
                    </h1>
                    <p className="text-4xl">{err}</p>
                </div>
            </>
        );

    return (
        <>
            <style global jsx>{`
                html,
                body,
                div#__next {
                    height: 100vh;
                    background-color: #ab3942;
                }

                pre {
                    background: white;
                }

                #screen {
                    display: grid;
                    grid-template-columns: repeat(
                        ${test.questions.length + 2},
                        1fr
                    );
                    gap: 1rem;
                    grid-auto-rows: max(2em);
                    border: 4px solid #6b7280;
                    border-radius: 12px;
                    background: white;
                    padding: 0.75rem;
                    margin: 2rem;
                    width: fit-content;
                    align-items: center;
                }

                h3 {
                    text-align: center;
                    padding: 0.5rem;
                }

                p {
                    display: inline-block;
                    text-align: center;
                    padding: 0.5rem;
                }

                .name {
                    font-weight: bold;
                }

                .header {
                    border-bottom: 2px solid #cbd5e1;
                    margin-left: 2rem;
                    margin-right: 2rem;
                }

                #menubtn {
                    position: fixed;
                    background-color: #ffffff80;
                    backdrop-filter: blur(1em);
                    border-top: 1px solid #6b7280;
                    border-right: 1px solid #6b7280;
                    border-bottom: 1px solid #6b7280;
                    top: calc(50vh - 2.5rem);
                    left: 0;
                    border-radius: 0 25% 25% 0;
                    z-index: 30;
                }

                .normal {
                    transform: translateX(0%);
                    transition: transform 0.5s;
                }

                .extended {
                    transform: translateX(calc(25vw));
                    transition: transform 0.5s;
                }

                #menu {
                    position: fixed;
                    background-color: #ffffff80;
                    backdrop-filter: blur(1em);
                    /* border: 0.1em solid #6b7280; */
                    width: 25vw;
                    height: 100vh;
                    top: 0;
                    box-shadow: 0.5em 0em 1em rgba(0, 0, 0, 0.2);
                    z-index: 20;
                }

                #menu::after {
                    content: "";
                    z-index: -1;
                    position: absolute;
                    inset: calc(50vh + 1px + 2.5rem) 0 0 0;
                    border-right: 1px solid #6b7280;
                }

                #menu::before {
                    content: "";
                    z-index: -1;
                    position: absolute;
                    inset: 0;
                    height: calc(50vh - 2.5rem);
                    border-right: 1px solid #6b7280;
                }

                .closed {
                    transform: translateX(-100%);
                    transition: transform 0.5s;
                }

                .open {
                    transform: translateX(0%);
                    transition: transform 0.5s;
                }

                .option {
                    display: block;
                    z-index: 1;
                    font-size: 1.5rem;
                    line-height: 2rem;
                    text-align: center;
                    margin: 1rem 0;
                    width: 100%;
                }

                #menusvg {
                    transform: rotate(90deg);
                }
            `}</style>

            <div className="text-center">
                <h1 className="text-2xl text-center">
                    Signed in as {session?.user?.name}
                </h1>
                <button className="mx-auto text-2xl" onClick={() => signOut()}>
                    Sign out
                </button>
            </div>

            <div>
                <div id="menu" className="closed">
                    <button
                        onClick={() => setMode("table")}
                        className={`option ${
                            mode === "table" ? "font-bold" : ""
                        }`}
                    >
                        Table
                    </button>
                    <button
                        onClick={() => setMode("pie")}
                        className={`option ${
                            mode === "pie" ? "font-bold" : ""
                        }`}
                    >
                        Pie
                    </button>
                    <button
                        onClick={() => setMode("raw")}
                        className={`option ${
                            mode === "raw" ? "font-bold" : ""
                        }`}
                    >
                        Raw
                    </button>
                </div>
            </div>

            <button id="menubtn" onClick={() => menu()} className="normal">
                <svg
                    id="menusvg"
                    className="w-6 h-20 top-0 left-0"
                    fill="black"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
                <svg
                    id="closesvg"
                    className="hidden w-6 h-20 top-0 left-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    ></path>
                </svg>
            </button>

            {mode === "table" && (
                <div id="screen">
                    <h3 className="name header"> Team Name </h3>
                    <h3 className="name header"> Time </h3>
                    {test.questions.map((e, i) => (
                        <p className="header" key={i}>
                            Q{i + 1}
                        </p>
                    ))}
                    {data.map((team, i) => (
                        <>
                            <div className="relative">
                                <h3 className="name peer hover:bg-gray-300">
                                    {team.teamInfo["team-name"]}
                                </h3>
                                <div className="absolute rounded-md bg-black px-1.5 py-1 left-1/2 opacity-0 peer-hover:opacity-70 -translate-x-1/2 z-10">
                                    {team.teamInfo["c1"].name && (
                                        <span className="text-white">
                                            {gender(team.teamInfo["c1"].gender)}
                                            {team.teamInfo["c1"].name} <br></br>
                                        </span>
                                    )}
                                    {team.teamInfo["c2"].name && (
                                        <span className="text-white">
                                            {gender(team.teamInfo["c2"].gender)}
                                            {team.teamInfo["c2"].name} <br></br>
                                        </span>
                                    )}
                                    {team.teamInfo["c3"].name && (
                                        <span className="text-white">
                                            {gender(team.teamInfo["c3"].gender)}
                                            {team.teamInfo["c3"].name} <br></br>
                                        </span>
                                    )}
                                    {team.teamInfo["c4"].name && (
                                        <span className="text-white">
                                            {gender(team.teamInfo["c4"].gender)}
                                            {team.teamInfo["c4"].name} <br></br>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h3>{team.time ? `${formatDiff(team.time.timeEnded - team.time.timeStarted)} | ${formatMS(team.time.timeStarted)} to ${formatMS(team.time.timeEnded)}` : "N/A"}</h3>
                            {team.answers.map((e,i) => (
                                <p key={i.toString()}> {e} </p>
                            ))}
                        </>
                    ))}
                </div>
            )}
            {/* temp disable */}
            {false && mode === "pie" && (
                <>
                    <div className="border-4 border-solid border-gray-300 bg-white rounded-lg w-2/3 mx-auto my-8 py-1">
                        <h1 className="text-center font-semibold text-4xl mb-2">
                            Instructions:
                        </h1>
                        {test.instructions?.map(i => (
                            <p className="text-center text-2xl" key={i}>
                                {i}
                            </p>
                        )) ?? (
                            <>
                                <p className="text-center text-2xl">
                                    just answer the questions lol
                                </p>
                                <p className="text-center text-2xl">
                                    do yo best
                                </p>
                            </>
                        )}
                    </div>

                    {test.pdf && (
                        <object
                            data={`data:application/pdf;base64,${pdf}#toolbar=0&navpanes=0`}
                            type="application/pdf"
                            className="w-3/5 h-2/3 mx-auto"
                        >
                            <a
                                className="block border-4 border-solid border-gray-300 bg-white rounded-lg w-2/3 mx-auto text-center my-16 font-semibold py-1 px-1 text-3xl"
                                href={ans.pdf}
                            >
                                Click here to download the PDF file with
                                questions.
                            </a>
                        </object>
                    )}
                    {test.questions.map((s, i) => (
                        <div
                            className="text-center flex items-center justify-center my-16"
                            key={`container-${i}`}
                        >
                            <div
                                className="border-4 border-solid border-gray-300 rounded-lg w-2/3 bg-white py-2 px-4"
                                key={`div-${i}`}
                            >
                                <h2
                                    className="text-3xl font-semibold"
                                    key={`qnum-${i}`}
                                >
                                    Q{i + 1}
                                </h2>
                                {!test.pdf && (
                                    <p
                                        className="text-2xl my-2 text-center w-full mx-auto"
                                        id={`katex-outp-${i}`}
                                        key={`q-${i}`}
                                    >
                                        {s.question}
                                    </p>
                                )}
                                {!isSSR &&
                                    !test.pdf &&
                                    $(`#katex-outp-${i}`) &&
                                    renderMathInElement(
                                        $(`#katex-outp-${i}`),
                                        options
                                    )}

                                {Attachment(s)}

                                {s.type === "long" && (
                                    <textarea
                                        type="text"
                                        className="inputs outline-none w-full text-2xl p-3 border-4 my-4 border-gray-300 border-solid"
                                        key={`inp-${i}`}
                                    />
                                )}
                                {s.type === "short" && (
                                    <input
                                        type="text"
                                        className="inputs outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"
                                        key={`inp-${i}`}
                                    />
                                )}
                                {/* <form className="text-left">
                                {
                                    ["1", "1/2", "3", "5"].map((e, i) => <div key={`${i}`}>
                                        <input type="radio" id={`${i}`} name = "question"/>
                                        <label for={`${i}`} className="mx-2 text-xl">{e}</label>
                                    </div>)
                                }
                            </form> */}

                                <button
                                    onClick={() => openQuestion(s, i)}
                                    className="top-5 right-5 z-10"
                                >
                                    <svg
                                        className="w-12 h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        ></path>
                                    </svg>
                                </button>
                                <div
                                    id={`res-${i}`}
                                    className="hidden absolute"
                                >
                                    <Pie
                                        data={{
                                            labels: [
                                                "Other",
                                                totalFreq[i][1][0],
                                                totalFreq[i][0][0],
                                            ],
                                            datasets: [
                                                {
                                                    label: "Answers",
                                                    data: [
                                                        ans.length -
                                                            totalFreq[i][0][1] -
                                                            totalFreq[i][1][1],
                                                        totalFreq[i][1][1],
                                                        totalFreq[i][0][1],
                                                    ],
                                                    backgroundColor: [
                                                        "rgba(54, 162, 235, 0.6)",
                                                        "rgba(54, 162, 235, 0.4)",
                                                        "rgba(54, 162, 235, 0.2)",
                                                    ],
                                                    borderColor: [
                                                        "rgba(54, 162, 235, 1)",
                                                        "rgba(54, 162, 235, 1)",
                                                        "rgba(54, 162, 235, 1)",
                                                    ],
                                                    borderWidth: 1,
                                                },
                                            ],
                                        }}
                                        options={{ maintainAspectRatio: false }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
            {mode === "raw" && <pre>{JSON.stringify(data, null, 4)}</pre>}
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

export async function getServerSideProps({ params }) {
    try {
        let res = await fs.promises.readFile(`../tests/${params.qid}_ans.json`);
        res = JSON.parse(res);

        let test = await fs.promises.readFile(`../tests/${params.qid}.json`);
        test = JSON.parse(test);

        let b64pdf = null;
        if (test?.pdf) {
            b64pdf = await getBinary(test.pdf);
            b64pdf = base64Encode(b64pdf);
        }

        return {
            props: {
                data: res,
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
