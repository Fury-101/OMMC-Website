import renderMathInElement from "katex/dist/contrib/auto-render.js"

function Test({ test, isSSR, pdf}) {
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

    function Attachment(s) {
        if (s.attached?.type === `image`) {
            return <img src={s.attached?.src} className="mx-auto"/> 
        }
    }

    return <>
        {test.pdf && <object
            data={`data:application/pdf;base64,${pdf}#toolbar=0&navpanes=0`}
            type="application/pdf"
            className="pdf w-3/5 mx-auto"
        >
            <a className="block border-4 border-solid border-gray-300 bg-white rounded-lg w-2/3 mx-auto text-center my-16 font-semibold py-1 px-1 text-3xl" href={test.pdf}>Click here to download the PDF file with questions.</a>
        </object>}
        {
            test.questions.map((s, i) => 
                <div className='text-center flex items-center justify-center my-16' key={`container-${i}`}>
                    <div className='bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4' key={`div-${i}`}>
                        <h2 className='text-3xl font-semibold text-red-700' key={`qnum-${i}`}>Q{i+1}</h2>
                        {!test.pdf && <p className='text-2xl my-2 text-center w-full mx-auto' id = {`katex-outp-${i}`} key={`q-${i}`}> {s.question} </p>}
                        {!isSSR && !test.pdf && renderMathInElement(document.getElementById(`katex-outp-${i}`), options)}

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
    </>
}

export default Test;