import React from 'react';
import ChatInput from './ChatInput';

// Scrapter Logo Component
const ScrapterLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5000 4530" className="w-full h-full drop-shadow-sm">
        <g fill="rgb(241,98,41)">
            <path d="M2127 4125 c-273 -44 -527 -150 -738 -306 -61 -45 -69 -55 -92 -117 -37 -100 -75 -280 -88 -420 -44 -468 167 -949 523 -1185 83 -56 202 -117 226 -117 7 0 -13 33 -43 73 -67 87 -137 225 -165 327 -28 97 -38 290 -20 397 75 469 501 880 1021 987 222 46 477 46 668 1 22 -6 23 -4 11 10 -25 30 -215 151 -310 197 -123 60 -238 100 -386 134 -105 24 -143 28 -319 30 -139 2 -227 -1 -288 -11z" />
            <path d="M2796 2949 c4 -8 25 -36 46 -62 121 -154 198 -382 198 -586 0 -464 -334 -894 -831 -1069 -182 -64 -270 -77 -519 -76 -187 1 -240 5 -315 21 -93 21 -109 21 -83 0 315 -258 641 -387 1023 -404 343 -15 694 83 982 276 134 90 145 103 177 205 106 341 110 635 14 940 -96 306 -312 573 -578 714 -89 47 -126 61 -114 41z" />
            <path d="M2970 3634 c-189 -23 -328 -60 -469 -125 -245 -113 -479 -337 -583 -555 -21 -45 -38 -85 -38 -88 0 -3 35 23 79 58 285 230 617 275 970 131 127 -52 242 -129 360 -241 209 -200 325 -408 398 -714 34 -145 43 -396 19 -558 -9 -62 -20 -120 -23 -130 -13 -36 35 19 94 107 167 250 256 505 284 814 27 290 -43 638 -179 897 -39 74 -150 244 -181 277 -24 26 -166 73 -307 103 -96 20 -342 34 -424 24z" />
            <path d="M1018 3456 c-147 -192 -257 -449 -306 -711 -26 -142 -23 -428 6 -574 51 -253 143 -469 280 -658 33 -45 57 -67 86 -79 322 -131 640 -155 963 -74 310 78 584 271 737 519 55 89 100 180 93 187 -1 2 -39 -24 -82 -56 -193 -145 -402 -210 -633 -197 -522 29 -966 445 -1091 1022 -41 188 -45 425 -11 615 6 34 10 63 8 65 -2 2 -24 -25 -50 -59z" />
        </g>
    </svg>
);

interface WelcomeViewProps {
    username: string;
    onSuggestionClick: (text: string) => void;
    onStartChat: (message: string) => void;
    draftText?: string;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ username, onSuggestionClick, onStartChat, draftText }) => {

    const starterCards = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.753 9.753 0 00-3.255.555.75.75 0 00-.575.826 13.733 13.733 0 01-.06 3.872c0 .53.05 1.056.148 1.57h13.494c.098-.514.148-1.04.148-1.57 0-1.333-.02-2.628-.06-3.872a.75.75 0 00-.575-.826C14.155 3.96 12.758 3.75 11.25 3.75z" />
                    <path fillRule="evenodd" d="M18.156 5.853a.75.75 0 01.127.46c0 1.255-.025 2.474-.07 3.655-.035.918-.328 1.838-.967 2.476a2.983 2.983 0 01-1.396.65c-.05.212-.116.421-.196.626a5.25 5.25 0 00-1.047 3.55 3.003 3.003 0 01-2.002 2.916.75.75 0 01-.257.045c-.477 0-.916-.17-1.254-.46a3.005 3.005 0 01-1.048-2.5 5.25 5.25 0 00-1.046-3.551c-.08-.206-.147-.414-.197-.626a2.98 2.98 0 01-1.396-.651c-.639-.638-.932-1.558-.967-2.475-.045-1.182-.07-2.4-.07-3.656a.75.75 0 01.127-.46L6 5.613V5.53l.063.037c.39.227.81.42 1.248.572.155.054.312.103.47.147.28.077.564.146.852.203.746.149 1.516.236 2.302.254a22.316 22.316 0 00.322.007c1.334.015 2.651-.122 3.93-.404a11.512 11.512 0 001.323-.35c.437-.152.857-.345 1.247-.572L18 5.53v.083l-.156-.24zM16.48 9.68a1.49 1.49 0 00.52-.962V8.71a9.753 9.753 0 00-3.255.555.75.75 0 00-.575.827c.04.887.06 1.79.06 2.709 0 1.875-.3 3.69-.854 5.397a1.503 1.503 0 01-1.128.986.75.75 0 01-.643-.223c-.22-.22-.486-.395-.783-.509a5.25 5.25 0 01-1.493-1.065 1.488 1.488 0 00-.608-.344z" clipRule="evenodd" />
                </svg>
            ),
            title: "Draft Email",
            prompt: "Draft a professional email to...",
            color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                </svg>
            ),
            title: "Analyze Page",
            prompt: "Summarize the key points of this page.",
            color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V4.875C21.75 3.84 20.91 3 19.875 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h12a.75.75 0 000-1.5H6zm6 4.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
            ),
            title: "Scrape Data",
            prompt: "Find and extract pricing data from...",
            color: "text-green-500 bg-green-50 dark:bg-green-900/20"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.387 17.387 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.165 17.165 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.981 11.267 11.267 0 01-3.746 2.562 1.834 1.834 0 00-2.37-2.37 11.262 11.262 0 01-2.562-3.746 9.765 9.765 0 012.562-.427zM12 3.453c.682 0 1.356.044 2.022.13-.873 3.539-3.41 6.076-6.948 6.948A9.75 9.75 0 0112 3.453z" />
                </svg>
            ),
            title: "Plan Trip",
            prompt: "Help me plan a 3-day trip to...",
            color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20"
        }
    ];

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-black relative">

            {/* Center Content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[90%] mx-auto pb-24 space-y-8">

                {/* Logo/Icon */}
                <div className="w-14 h-14 opacity-90 transition-transform hover:scale-105 duration-500">
                    <ScrapterLogo />
                </div>

                {/* Greeting */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                        Hi {username}!
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                        Ready to help you browse smarter.
                    </p>
                </div>

                {/* Suggestion Grid (Cards) */}
                <div className="grid grid-cols-2 gap-3 w-full">
                    {starterCards.map((card, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSuggestionClick(card.prompt)}
                            className="flex flex-col items-start p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-orange-200 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-200 text-left group"
                        >
                            <div className={`p-2 rounded-xl mb-2 ${card.color}`}>
                                {card.icon}
                            </div>
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                                {card.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                                {card.prompt}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Input positioned at bottom */}
            <div className="w-full px-0 absolute bottom-4">
                <ChatInput
                    onSend={onStartChat}
                    placeholder="Ask anything..."
                    draftText={draftText}
                    onStopTask={() => { }}
                    disabled={false}
                    showStopButton={false}
                />
            </div>
        </div>
    );
};

export default WelcomeView;