import React from 'react'
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Menu, User, X, Youtube } from 'lucide-react';
import { Newspaper, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';


function LandingLayout({ children }) {
    const currentYear = new Date().getFullYear();
    const { auth } = usePage().props;
    const user = auth.user;
    return (
        <>
            <div className="w-full fixed z-[99] border-b bg-base-100">
                <div className="navbar max-w-7xl mx-auto px-4">

                    {/* LEFT */}
                    <div className="navbar-start">
                        {/* Mobile Menu */}
                        <div className="dropdown lg:hidden">
                            <label tabIndex={0} className="btn btn-ghost btn-circle">
                                <Menu className="w-5 h-5" />
                            </label>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                            >
                                <li><Link href={"/"}>Beranda</Link></li>
                                <li><Link href={"/tentang"}>Tentang</Link></li>
                                <li><Link href={"/harga"}>Harga</Link></li>
                            </ul>
                        </div>

                        {/* Logo */}
                        <a className="btn btn-ghost text-xl font-bold">
                            <ApplicationLogo className="w-auto h-6 md:h-8" />
                        </a>
                    </div>

                    {/* CENTER (Desktop Menu) */}
                    <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal px-1 gap-1">
                            <li><Link href={"/"}>Beranda</Link></li>
                            <li><Link href={"/tentang"}>Tentang</Link></li>
                            <li><Link href={"/harga"}>Harga</Link></li>
                        </ul>
                    </div>

                    {/* RIGHT */}
                    <div className="navbar-end gap-2">
                        {user ? (
                            <Dropdown
                                trigger={
                                    <button className="btn btn-ghost flex items-center gap-2">
                                        <User size={20} />
                                        <span>{user.name}</span>
                                    </button>
                                }
                            >
                                <Dropdown.Link href={route('dashboard')}>
                                    Dashboard
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown>
                        ) : (
                            <>
                                <Link href={route('login')} className="btn btn-ghost">Login</Link>
                                <Link href={route('register')} className="btn btn-primary">Daftar</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {children}
            <footer className="bg-base-300">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="space-y-4">
                            <Link href="/" className="flex items-center gap-2 group">
                                <ApplicationLogo className="w-auto h-8 md:h-8" />
                            </Link>
                            <p className="text-sm opacity-80 leading-relaxed">
                                Platform jurnalisme yang mendorong konten positif dan konstruktif untuk Indonesia yang lebih baik.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-serif text-lg font-semibold mb-4">Tautan Cepat</h4>
                            <ul className="space-y-2">
                                {[
                                    { label: "Beranda", href: "/" },
                                    { label: "Tentang Kami", href: "/tentang" },
                                    { label: "Harga", href: "/harga" },
                                    { label: "Mulai Menulis", href: "/register" },
                                ].map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:underline"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-serif text-lg font-semibold mb-4">Kontak</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm opacity-80">
                                    <Mail className="w-4 h-4" />
                                    <span>redaksi@timesindonesia.co.id</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm opacity-80">
                                    <Phone className="w-4 h-4" />
                                    <span>(0341) 563566</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm opacity-80">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>Jl. Besar Ijen No.90, Oro-oro Dowo, Kec. Klojen, Kota Malang, Jawa Timur 65116</span>
                                </li>
                            </ul>
                        </div>

                        {/* Social */}
                        <div>
                            <h4 className="font-serif text-lg font-semibold mb-4">Ikuti Kami</h4>
                            <div className="flex gap-3">
                                {[
                                    { icon: Facebook, href: "https://www.facebook.com/timesindonesia.co.id", label: "Facebook" },
                                    { icon: X, href: "https://x.com/timescoid", label: "Twitter" },
                                    { icon: Instagram, href: "https://www.instagram.com/timesindonesia", label: "Instagram" },
                                    { icon: Youtube, href: "https://www.youtube.com/@timesIDN", label: "LinkedIn" },
                                ].map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="mt-12 pt-8 border-t border-primary/20">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-sm opacity-70">
                                © {currentYear} AJP - Aplikasi Jurnalisme Positif. Hak cipta dilindungi.
                            </p>
                            <div className="flex gap-6">
                                <Link href="/kebijakan-privasi" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                                    Kebijakan Privasi
                                </Link>
                                <Link href="/syarat-ketentuan" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                                    Syarat & Ketentuan
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default LandingLayout