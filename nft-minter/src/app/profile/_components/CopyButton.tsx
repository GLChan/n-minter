"use client"

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      title="复制地址"
      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      onClick={() => {
        if (text) {
          navigator.clipboard.writeText(text);
          alert('钱包地址已复制');
        }
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>
  )
}