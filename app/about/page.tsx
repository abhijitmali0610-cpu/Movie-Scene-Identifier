export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
        About Visual Search AI
      </h1>
      
      <div className="bg-neutral-900 border border-white/5 p-8 md:p-12 rounded-3xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        <p className="text-neutral-400 leading-relaxed text-lg">
          We believe finding visually stunning media should be effortless. Our mission is to bridge the gap between human curiosity and massive media libraries using state-of-the-art multimodal AI systems.
        </p>

        <h2 className="text-2xl font-bold text-white pt-6 border-t border-white/5">The Magic Behind the Scenes</h2>
        <p className="text-neutral-400 leading-relaxed text-lg">
          Visual Search AI leverages top-tier vision foundation models to decode the pixels of your uploaded screenshots. By instantly identifying actors, color grading, shot composition, and specific visual signatures, our AI engine crosses billions of billions of parameters to precisely track down the exact series or feature film your scene belongs to.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
           <div className="bg-neutral-950 p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold text-purple-400 mb-2">Lightning Fast</h3>
              <p className="text-sm text-neutral-500">Optimized inference times deliver your matches in mere seconds.</p>
           </div>
           <div className="bg-neutral-950 p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold text-blue-400 mb-2">Multimodal AI</h3>
              <p className="text-sm text-neutral-500">Interprets deep visual context alongside textual meta-data instantly.</p>
           </div>
           <div className="bg-neutral-950 p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold text-pink-400 mb-2">Privacy First</h3>
              <p className="text-sm text-neutral-500">Your uploaded images are processed temporarily and immediately discarded.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
