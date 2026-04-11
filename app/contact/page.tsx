export default function ContactUs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
        Contact Us
      </h1>
      
      <div className="bg-neutral-900 border border-white/5 p-8 md:p-12 rounded-3xl shadow-xl space-y-8 flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bold text-white">Get in Touch</h2>
            <p className="text-neutral-400 leading-relaxed text-lg">
              Whether you're curious about integrating our top-class AI models into your enterprise, or you just have a feature request, our team is always eager to chat.
            </p>
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-neutral-300">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">@</div>
                    <span>hello@visualsearchai.com</span>
                </div>
                <div className="flex items-center gap-4 text-neutral-300">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">#</div>
                    <span>Join our Developer Discord</span>
                </div>
            </div>
        </div>
        
        <div className="flex-1 bg-neutral-950 p-6 md:p-8 rounded-2xl border border-white/5">
            <form className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-400">Name</label>
                    <input type="text" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all" placeholder="Ada Lovelace" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-400">Email</label>
                    <input type="email" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all" placeholder="ada@example.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-400">Message</label>
                    <textarea rows={4} className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none" placeholder="How can the AI team help?" />
                </div>
                <button type="button" className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-900/40">
                    Send Message
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
