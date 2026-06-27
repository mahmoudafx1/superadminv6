export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-[1400px] mx-auto p-6">
                {children}
            </div>
        </div>
    );
}