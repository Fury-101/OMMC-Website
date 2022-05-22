export default function Registration() {
    const req = <span className="text-2xl text-red-600">*</span>;

    return (
        <>
            <form id="general" method="post">
                <div className="text-center flex items-center justify-center my-16">
                    <div className="bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4">
                        <p className="text-2xl my-2 text-center w-full mx-auto">
                            Team Name{req}
                        </p>
                        <input
                            name="team-name"
                            type="text"
                            placeholder="Team Raccoons"
                            className="general bg-slate-100 outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"
                            required
                        />
                    </div>
                </div>
                <div className="text-center flex items-center justify-center my-16">
                    <div className="bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4">
                        <p className="text-2xl my-2 text-center w-full mx-auto">
                            If your team places on the leaderboard, would you
                            like to be credited?{req}
                        </p>
                        <input
                            name="lb-show"
                            type="checkbox"
                            className="general bg-slate-100 outline-none h-16 w-full p-3 my-4"
                        />
                    </div>
                </div>
            </form>
            {[1, 2, 3, 4].map(i => (
                <div id={`c${i}`} className="my-16">
                    <div className="text-center flex items-center justify-center mx-auto">
                        <button
                            type="button"
                            onClick={() => {
                                document
                                    .getElementById(`c${i}-questions`)
                                    .classList.toggle("hidden");
                                document
                                    .getElementById(`c${i}-btn`)
                                    .classList.toggle("-rotate-90");
                            }}
                            className="flex items-center"
                        >
                            <p className="text-3xl text-center inline-block">
                                Competitor {i}
                                {i == 1 && req}
                            </p>
                            <svg
                                id={`c${i}-btn`}
                                className="-rotate-90 transition ease-in-out w-9 h-9 mt-1 inline-block"
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
                    </div>
                    <form
                        id={`c${i}-questions`}
                        className="hidden"
                        method="post"
                    >
                        <div className="text-center flex items-center justify-center my-16">
                            <div className="bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4">
                                <p className="text-2xl my-2 text-center w-full mx-auto">
                                    Name{req}
                                </p>
                                <input
                                    name="email"
                                    type="text"
                                    placeholder="John Doe"
                                    className="bg-slate-100 outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"
                                    required
                                />
                            </div>
                        </div>
                        <div className="text-center flex items-center justify-center my-16">
                            <div className="bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4">
                                <p className="text-2xl my-2 text-center w-full mx-auto">
                                    Email{req}
                                </p>
                                <input
                                    name="email"
                                    type="text"
                                    placeholder="johndoe@gmail.com"
                                    className="bg-slate-100 outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"
                                    required
                                />
                            </div>
                        </div>
                        <div className="text-center flex items-center justify-center my-16">
                            <div className="bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4">
                                <p className="text-2xl my-2 text-center w-full mx-auto">
                                    Current Grade{req}
                                </p>
                                <input
                                    name="grade"
                                    type="text"
                                    placeholder="9"
                                    className="bg-slate-100 outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"
                                    required
                                />
                            </div>
                        </div>
                        <div className="text-center flex items-center justify-center my-16">
                            <div className="bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4">
                                <p className="text-2xl my-2 text-center w-full mx-auto">
                                    What gender do you identify as?
                                </p>
                                <input
                                    name="gender"
                                    type="text"
                                    className="bg-slate-100 outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"
                                />
                            </div>
                        </div>
                        <div className="text-center flex items-center justify-center my-16">
                            <div className="bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4">
                                <p className="text-2xl my-2 text-center w-full mx-auto">
                                    Current School
                                </p>
                                <input
                                    name="school"
                                    type="text"
                                    className="bg-slate-100 outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"
                                />
                            </div>
                        </div>
                        <div className="text-center flex items-center justify-center my-16">
                            <div className="bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4">
                                <p className="text-2xl my-2 text-center w-full mx-auto">
                                    Contact / Phone Number
                                </p>
                                <input
                                    name="contact"
                                    type="text"
                                    placeholder="(555)-555-5555"
                                    className="bg-slate-100 outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"
                                />
                            </div>
                        </div>
                        <div className="text-center flex items-center justify-center my-16">
                            <div className="bg-slate-200 border-4 border-solid border-gray-300 rounded-lg w-2/3 py-2 px-4">
                                <p className="text-2xl my-2 text-center w-full mx-auto">
                                    Discord Tag
                                </p>
                                <input
                                    name="discord"
                                    type="text"
                                    placeholder="ModularBread#7790"
                                    className="bg-slate-100 outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            ))}
        </>
    );
}
