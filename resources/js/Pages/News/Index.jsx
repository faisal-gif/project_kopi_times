import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate, formatDateTime } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
// Tambahkan Icon Instagram dan FileText (untuk ekoran)
import { AlertTriangle, Crown, Eye, Newspaper, Plus, Search, TrendingUp, Instagram, FileText, PhoneCall, Phone } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ news, writers, kanals, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const { auth } = usePage().props;
  const user = auth.user;

  const isFirst = useRef(true);
  const INDEX_ROUTE = route('news.index');

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    let timeout = null;
    if (search !== filters.search) {
      timeout = setTimeout(() => {
        router.get(
          INDEX_ROUTE,
          { search, status, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    } else {
      router.get(
        INDEX_ROUTE,
        { search, status, page: 1 },
        { preserveState: true, replace: true }
      );
    }

    return () => timeout && clearTimeout(timeout);
  }, [search, status]);

  function handleReset() {
    setSearch('');
    setStatus('');
    router.get(
      INDEX_ROUTE,
      { search: '', status: '', page: 1 },
      { preserveState: true, replace: true }
    );
  }

  // FUNGSI BARU UNTUK TRIGGER REQUEST
  function handleRequestAddon(newsId, jenis, kuotaTersedia) {
    // Mapping nama layanan agar lebih rapi dan mudah jika ada penambahan lagi ke depannya
    const labelLayanan = {
      feed_instagram: 'Feed IG',
      ekoran: 'Ekoran',
      wa_channel: 'WA Channel'
    }[jenis] || jenis; // fallback ke 'jenis' jika tidak ditemukan di object

    if (kuotaTersedia <= 0) {
      alert(`Kuota ${labelLayanan} Anda habis. Silakan perpanjang membership.`);
      return;
    }

    if (confirm(`Gunakan 1 kuota untuk jadikan berita ini ${labelLayanan}?`)) {
      router.post(route('news.request-addon', newsId), {
        jenis_request: jenis
      }, {
        preserveScroll: true
      });
    }
  }

  // Helper untuk mengecek apakah sebuah berita sudah direquest
  function checkRequestStatus(addonRequests, jenis) {
    if (!addonRequests || addonRequests.length === 0) return false;
    // Cek jika ada request yang statusnya bukan rejected
    return addonRequests.some(req => req.jenis_request === jenis && req.status !== 'rejected');
  }

  function getStatusBadge(status) {
    switch (status) {
      case "pending":
      case '0':
      case 0:
        return <span className="badge badge-secondary badge-soft">Pending</span>;
      case "Review":
      case '2':
      case 2:
        return <span className="badge badge-warning badge-soft">Review</span>;
      case "On Pro":
      case '3':
      case 3:
        return <span className="badge badge-error badge-soft">OnPro</span>;
      case "Publish":
      case '1':
      case 1:
        return <span className="badge badge-success badge-soft">Publish</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  }

  return (
    <>
      <Head title="News Management" />
      <AuthenticatedLayout >
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className=" space-y-6">

              {/* Header Info */}
              <div className='flex flex-row justify-between items-center'>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar News</h1>
                </div>
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Home</a></li>
                    <li>News</li>
                  </ul>
                </div>
              </div>

              {/* Start Head Banner Kuota */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {user?.quota_news > 0 && new Date(user?.dateexp) > new Date() ? (
                  <Link href={route('news.create')} className="btn btn-primary rounded-lg">
                    <Plus size={16} /> Tambah Opini
                  </Link>
                ) : (
                  <Card className='border-2 border-primary/50 bg-primary/5 w-full md:w-auto'>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-semibold text-destructive">Kuota artikel atau masa berlaku habis!</p>
                          <p className="text-sm text-muted-foreground">Upgrade paket membership untuk menambah kuota.</p>
                        </div>
                      </div>
                      <Link className='btn btn-outline btn-primary shrink-0' href={route('subscription.index')}>
                        <Crown className="w-4 h-4 mr-2" />
                        Perpanjang Member
                      </Link>
                    </div>
                  </Card>
                )}
              </div>

              {/* TAMPILAN INFORMASI KUOTA USER SAAT INI */}
              {user?.package_id != 10 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card className="flex items-center gap-3 p-4">
                    <Newspaper className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sisa Artikel</p>
                      <p className="text-xl font-bold">{user?.quota_news}</p>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-3 p-4">
                    <Instagram className="w-6 h-6 text-pink-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sisa Feed IG</p>
                      <p className="text-xl font-bold">{user?.feed_instagram}</p>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-3 p-4">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sisa Ekoran</p>
                      <p className="text-xl font-bold">{user?.ekoran}</p>
                    </div>
                  </Card>

                  <Card className="flex items-center gap-3 p-4">
                    <Phone className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sisa Whatsapp Channel</p>
                      <p className="text-xl font-bold">{user?.wa_channel}</p>
                    </div>
                  </Card>
                </div>
              )}

              {/* Start Filter */}
              <Card>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <div className="w-full md:w-96">
                    <InputWithPrefix
                      prefix={<Search size={16} />}
                      placeholder="Search Title and Id..."
                      className='w-full'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <InputSelect
                      value={status}
                      placeholder='Status'
                      onChange={(e) => setStatus(e.target.value)}
                      options={[
                        { label: "All", value: "" },
                        { label: "Pending", value: "0" },
                        { label: "Review", value: "2" },
                        { label: "On Pro", value: "3" },
                        { label: "Publish", value: "1" },
                      ]}
                    />
                  </div>
                  <button type="button" className="btn btn-neutral md:ml-2" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </Card>

              {/* Start Table */}
              <Card className="overflow-hidden p-0">

                {/* DESKTOP VERSION */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Judul</th>
                        <th>Tanggal Upload</th>
                        <th>Status</th>
                        <th className="text-center">Add-ons</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.data.map((n) => {
                        const isFeedRequested = checkRequestStatus(n.addon_requests, 'feed_instagram');
                        const isEkoranRequested = checkRequestStatus(n.addon_requests, 'ekoran');
                        const isWAChannelRequested = checkRequestStatus(n.addon_requests, 'wa_channel');

                        return (
                          <tr key={n.id}>
                            <th>{n.id}</th>
                            <td className="whitespace-normal break-words max-w-md">{n.title}</td>
                            <td>{formatDate(n.created)}</td>
                            <td>{getStatusBadge(n.status)}</td>
                            <td>
                              <div className="flex items-center justify-center gap-2">
                                {/* Tombol Request Feed IG */}
                                <button
                                  onClick={() => handleRequestAddon(n.id, 'feed_instagram', user.feed_instagram)}
                                  disabled={isFeedRequested}
                                  className={`btn btn-sm btn-circle ${isFeedRequested ? 'btn-disabled opacity-50 bg-pink-100' : 'btn-outline border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white hover:border-pink-500'}`}
                                  title={isFeedRequested ? "Feed IG sedang diproses" : "Jadikan Feed IG"}
                                >
                                  <Instagram size={14} />
                                </button>

                                {/* Tombol Request Ekoran */}
                                <button
                                  onClick={() => handleRequestAddon(n.id, 'ekoran', user.ekoran)}
                                  disabled={isEkoranRequested}
                                  className={`btn btn-sm btn-circle ${isEkoranRequested ? 'btn-disabled opacity-50 bg-blue-100' : 'btn-outline border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500'}`}
                                  title={isEkoranRequested ? "Ekoran sedang diproses" : "Jadikan Ekoran"}
                                >
                                  <FileText size={14} />
                                </button>

                                {/* Tombol Request WA Channel */}
                                <button
                                  onClick={() => handleRequestAddon(n.id, 'wa_channel', user.wa_channel)}
                                  disabled={isWAChannelRequested}
                                  className={`btn btn-sm btn-circle ${isWAChannelRequested ? 'btn-disabled opacity-50 bg-gree-100' : 'btn-outline border-green-500 text-green-500 hover:bg-green-500 hover:text-white hover:border-green-500'}`}
                                  title={isWAChannelRequested ? "Ekoran sedang diproses" : "Jadikan WA Channel"}
                                >
                                  <Phone size={14} />
                                </button>
                              </div>
                            </td>
                            <td>
                              <div className="flex justify-end gap-2">
                                <Link href={route('news.show', n)} className="btn btn-sm btn-outline"><Eye size={16} /></Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE VERSION (Card Mode) */}
                <div className="md:hidden flex flex-col p-4 gap-4">
                  {news.data.map((n) => {
                    const isFeedRequested = checkRequestStatus(n.addon_requests, 'feed_instagram');
                    const isEkoranRequested = checkRequestStatus(n.addon_requests, 'ekoran');
                    const isWAChannelRequested = checkRequestStatus(n.addon_requests, 'wa_channel');

                    return (
                      <div key={n.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div>
                            <p className="font-semibold text-base">{n.title}</p>
                          </div>
                          {getStatusBadge(n.status)}
                        </div>

                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Tanggal:</span> {formatDate(n.created)}</p>
                        </div>

                        {/* Actions Mobile */}
                        <div className="flex flex-col items-center justify-between mt-4 pt-4 border-t border-base-200">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleRequestAddon(n.id, 'feed_instagram', user.feed_instagram)}
                              disabled={isFeedRequested}
                              className={`btn btn-sm ${isFeedRequested ? 'btn-disabled opacity-50' : 'btn-outline border-pink-500 text-pink-500'}`}
                            >
                              <Instagram size={14} /> Feed
                            </button>

                            <button
                              onClick={() => handleRequestAddon(n.id, 'ekoran', user.ekoran)}
                              disabled={isEkoranRequested}
                              className={`btn btn-sm ${isEkoranRequested ? 'btn-disabled opacity-50' : 'btn-outline border-blue-500 text-blue-500'}`}
                            >
                              <FileText size={14} /> Ekoran
                            </button>

                            <button
                              onClick={() => handleRequestAddon(n.id, 'wa_channel', user.wa_channel)}
                              disabled={isWAChannelRequested}
                              className={`btn btn-sm ${isWAChannelRequested ? 'btn-disabled opacity-50' : 'btn-outline border-green-500 text-green-500'}`}
                            >
                              <Phone size={14} /> Whatsapp Channel
                            </button>
                          </div>

                          <Link href={route('news.show', n)} className="btn btn-sm btn-outline"><Eye size={16} /></Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Pagination */}
              <PaginationDaisy data={news} />

            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index