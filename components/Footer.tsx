export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-12 py-8 text-center">
      <p className="text-zinc-600 text-xs">
        Your<span className="text-emerald-400">Hood</span> — keeping communities informed, together.
      </p>
      <p className="text-zinc-700 text-xs mt-1">© {new Date().getFullYear()} YourHood</p>
    </footer>
  );
}
