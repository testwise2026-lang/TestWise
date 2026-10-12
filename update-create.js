const fs = require('fs');

let content = fs.readFileSync('src/app/teacher/dashboard/tests/create/page.tsx', 'utf-8');

// 1. Add useEffect for mode detection
content = content.replace(
  "const [isParsing, setIsParsing] = useState(false);",
  "const [isParsing, setIsParsing] = useState(false);\n  const [mode, setMode] = React.useState('manual');\n\n  React.useEffect(() => {\n    const params = new URLSearchParams(window.location.search);\n    const currentMode = params.get('mode') || 'manual';\n    setMode(currentMode);\n    if (currentMode === 'bulk') setShowPDFModal(true);\n  }, []);"
);

// 2. Conditionally render the action cards based on mode
const actionCardsMatch = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">`;
const actionCardsReplace = `<div className={\`grid grid-cols-1 gap-4 \${mode === 'both' ? 'md:grid-cols-2' : ''}\`}>`;
content = content.replace(actionCardsMatch, actionCardsReplace);

const aiCardMatch = `<button \n            onClick={() => setShowAIModal(true)}\n            className="relative overflow-hidden group bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-3xl text-left border border-indigo-500/30 shadow-lg shadow-indigo-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"\n          >`;
const aiCardReplace = `{mode !== 'bulk' && (<button \n            onClick={() => setShowAIModal(true)}\n            className="relative overflow-hidden group bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-3xl text-left border border-indigo-500/30 shadow-lg shadow-indigo-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"\n          >`;
content = content.replace(aiCardMatch, aiCardReplace);

const aiCardEndMatch = `</p>\n              </div>\n            </div>\n          </button>`;
const aiCardEndReplace = `</p>\n              </div>\n            </div>\n          </button>)}`;
content = content.replace(aiCardEndMatch, aiCardEndReplace);

const pdfCardMatch = `<button \n            onClick={() => setShowPDFModal(true)}\n            className="relative overflow-hidden group bg-white p-6 rounded-3xl text-left border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"\n          >`;
const pdfCardReplace = `{mode === 'bulk' && (<button \n            onClick={() => setShowPDFModal(true)}\n            className="relative overflow-hidden group bg-white p-6 rounded-3xl text-left border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"\n          >`;
content = content.replace(pdfCardMatch, pdfCardReplace);

const pdfCardEndMatch = `</p>\n              </div>\n            </div>\n          </button>\n        </div>`;
const pdfCardEndReplace = `</p>\n              </div>\n            </div>\n          </button>)}\n        </div>`;
content = content.replace(pdfCardEndMatch, pdfCardEndReplace);

fs.writeFileSync('src/app/teacher/dashboard/tests/create/page.tsx', content);

