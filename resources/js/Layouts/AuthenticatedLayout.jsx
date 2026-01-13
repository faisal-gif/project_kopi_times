import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import {
    Clipboard,
    Crown,
    Edit,
    File,
    FolderInput,
    Globe,
    History,
    ImageIcon,
    ImagesIcon,
    LayoutDashboard,
    Link2,
    List,
    MapPin,
    Menu,
    NewspaperIcon,
    Pen,
    Settings,
    User
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    // ===== ACTIVE HELPERS =====
    const isActive = (names) => {
        if (Array.isArray(names)) {
            return names.some(name => route().current(name));
        }
        return route().current(names);
    };

    const linkClass = (active) =>
        `my-0.5 p-4 hover:bg-primary hover:text-white transition text-black
        ${active ? 'bg-primary hover:bg-primary/80 hover:text-white text-white font-semibold' : ''}`;

    // =========================

    return (
        <div className="drawer lg:drawer-open bg-base-300 ">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

            {/* ================= CONTENT ================= */}
            <div className="drawer-content overflow-x-auto">
                {/* NAVBAR */}
                <div className="navbar bg-base-100 border-b border-base-300 px-4">
                    <div className="flex-none lg:hidden">
                        <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
                            <Menu size={20} />
                        </label>
                    </div>

                    <div className="flex-1" />

                    <div className="flex-none">
                        <Dropdown
                            trigger={
                                <button className="btn btn-ghost flex items-center gap-2">
                                    <User size={20} />
                                    <span>{user.name}</span>
                                </button>
                            }
                        >
                            <Dropdown.Link href={route('profile.edit')}>
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown>
                    </div>
                </div>

                <main className="p-4 bg-primary/5 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>

            {/* ================= SIDEBAR ================= */}
            <div className="drawer-side">
                <label htmlFor="my-drawer-3" className="drawer-overlay"></label>

                <ul className="menu bg-base-100 min-h-full w-72 p-4 text-white">
                    {/* LOGO */}
                    <li>
                        <Link href="/">
                            <ApplicationLogo className="h-10 w-full mx-auto mb-6" />
                        </Link>
                    </li>

                    {/* DASHBOARD */}
                    <li>
                        <Link
                            href={route('dashboard')}
                            className={linkClass(isActive('dashboard'))}
                        >
                            <LayoutDashboard size={16} />
                            Dashboard
                        </Link>
                    </li>

                    <li>
                        <Link
                            href={route('news.index')}
                            className={linkClass(isActive('news.*'))}
                        >
                            <NewspaperIcon size={16} />
                            Opini
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={route('subscription.index')}
                            className={linkClass(isActive('subscription.*'))}
                        >
                            <Crown size={16} />
                            Membership
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}
