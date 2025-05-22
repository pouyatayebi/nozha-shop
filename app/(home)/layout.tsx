export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="p-4 bg-blue-100">Home Header</header>
      <main className="p-6">{children}</main>
      <footer className="p-4 bg-blue-100">Home Footer</footer>
    </div>
  );
}
// This layout component wraps the home page with a header and footer.