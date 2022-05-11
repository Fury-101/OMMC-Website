import renderMathInElement from "katex/dist/contrib/auto-render.js"

function Test({ qid, isSSR, pdf}) {
    const options = { //latex
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\begin{equation}", right: "\\end{equation}", display: true},
            {left: "\\begin{align}", right: "\\end{align}", display: true},
            {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
            {left: "\\begin{gather}", right: "\\end{gather}", display: true},
            {left: "\\begin{CD}", right: "\\end{CD}", display: true},
            {left: "\\[", right: "\\]", display: true}
        ]
    }

    function submit(ovrride) {
        if (isSSR) return;

        let unansPopup = document.getElementById("unanswered")
        let unanswered = false
        const answers = [...document.querySelectorAll(".inputs")].map(e => {
            if (e.value === "")
                unanswered = true
            return e.value.trim()
        })

        if (ovrride)
            unanswered = false

        if (unanswered) {
            unansPopup.showModal() //make them sad
            return
        }
        
        fetch(`${process.env.NEXT_PUBLIC_URL}/api/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: qid.id,
                answers: answers
            })
        })
        
        location.href = "/success"
    }

    function Attachment(s) {
        if (s.attached?.type === `image`) {
            return <img src={s.attached?.src} className="mx-auto"/> 
        }
    }

    return <>
        {qid.pdf && <object
            data={`data:application/pdf;base64,${pdf}#toolbar=0&navpanes=0`}
            type="application/pdf"
            className="pdf w-3/5 mx-auto"
        >
            <a className="block border-4 border-solid border-gray-300 bg-white rounded-lg w-2/3 mx-auto text-center my-16 font-semibold py-1 px-1 text-3xl" href={qid.pdf}>Click here to download the PDF file with questions.</a>
        </object>}
        {
            qid.questions.map((s, i) => 
                <div className='text-center block flex items-center justify-center my-16' key={`container-${i}`}>
                    <div className='bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4' key={`div-${i}`}>
                        <h2 className='text-3xl font-semibold text-red-700' key={`qnum-${i}`}>Q{i+1}</h2>
                        {!qid.pdf && <p className='text-2xl my-2 text-center w-full mx-auto' id = {`katex-outp-${i}`} key={`q-${i}`}> {s.question} </p>}
                        {!isSSR && !qid.pdf && renderMathInElement(document.getElementById(`katex-outp-${i}`), options)}

                        {Attachment(s)}

                        {s.type === "long" && <textarea type="text" className="inputs bg-slate-100 outline-none w-full text-2xl p-3 border-4 my-4 border-gray-300 border-solid" key={`inp-${i}`}/>}
                        {s.type === "short" && <input type="text" className="inputs bg-slate-100 outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid" key={`inp-${i}`}/>}
                        {/* <form className="text-left">
                            {
                                ["1", "1/2", "3", "5"].map((e, i) => <div key={`${i}`}>
                                    <input type="radio" id={`${i}`} name = "question"/>
                                    <label for={`${i}`} className="mx-2 text-xl">{e}</label>
                                </div>)
                            }
                        </form> */}
                    </div>
                </div>
            )
        }
        <dialog className="border-4 border-solid border-gray-300 bg-white rounded-lg" id="unanswered">
            <p className="text-xl font-semibold">Some questions have not been answered.</p>
            <form method="dialog">
                <button className='ml-auto drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-sky-500 hover:bg-sky-600 my-4 text-2xl transition duration-150' value="cancel">Close</button>
                <button onClick={() => submit(true)} className='ml-4 mr-auto drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 my-4 text-2xl transition duration-150'>Submit Anyways</button>
            </form>
        </dialog>
        <button onClick={() => submit(false)} className='drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 my-4 text-2xl transition duration-150'>Submit</button>
    </>
}

export default Test;