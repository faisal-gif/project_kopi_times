import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate, formatDateTime } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { AlertTriangle, Crown, Eye, Newspaper, Plus, Search, TrendingUp } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'


function Index({ news, writers, kanals, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const { auth } = usePage().props;
  const user = auth.user;


  const isFirst = useRef(true);
  const INDEX_ROUTE = route('news.index');

  useEffect(() => {
    // Lewati initial load (hindari double fetch)
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    let timeout = null;

    // Jika search berubah → debounce
    if (search !== filters.search) {
      timeout = setTimeout(() => {
        router.get(
          INDEX_ROUTE,
          { search, status, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    }
    // Jika status berubah → langsung fetch
    else {
      router.get(
        INDEX_ROUTE,
        { search, status, page: 1 },
        { preserveState: true, replace: true }
      );
    }

    return () => timeout && clearTimeout(timeout);
  }, [search, status,]);

  function handleReset() {
    setSearch('');
    setStatus('');

    router.get(
      INDEX_ROUTE,
      { search: '', status: '', page: 1 },
      { preserveState: true, replace: true }
    );
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


  function getHeadlineBadge(status) {
    switch (status) {
      case '1':
      case 1:
        return <span className="badge badge-primary badge-soft">ON</span>;

      case '0':
      case 0:
      case null:
        return <span className="badge badge-secondary badge-soft">OFF</span>;

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
              <div className='flex flex-row justify-between items-center'>
                {/* start Header */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar News</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Home</a></li>
                    <li>News</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Button Tambah User */}
                {user?.quota_news > 0 ? (
                  <Link href={route('news.create')} className="btn btn-primary rounded-lg">
                    <Plus size={16} /> Tambah News
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-semibold text-destructive">Kuota artikel Anda sudah habis!</p>
                        <p className="text-sm text-muted-foreground">Upgrade paket membership untuk menambah kuota.</p>
                      </div>
                    </div>

                    <Link className='btn btn-outline btn-primary' href={route('subscription.index')}>
                      <Crown className="w-4 h-4 mr-2" />
                      Perpanjang Member
                    </Link>
                  </div>
                )}
              </div>
              {/* End Head */}


              {/* Quota Card */}
              {
                user?.package_id != 10 && (
                  <Card className="mb-8 ">

                    <div className=" flex items-center gap-2 text-lg text-base-content/80 font-semibold">
                      <Newspaper className="w-5 h-5 text-primary" />
                      Sisa Kuota: {user?.quota_news} artikel
                    </div>
                  </Card>
                )
              }


              {/* Start Filter */}
              <Card>
                {/* Field Search And Filter */}
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

                  {/* RESET BUTTON */}
                  <button
                    type="button"
                    className="btn btn-neutral md:ml-2"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </Card>
              {/* End Filter */}

              {/* Start Table */}
              <Card>
                {/* MOBILE VERSION (Card Mode) */}
                <div className="md:hidden flex flex-col gap-4">
                  {/* Contoh data, ganti dengan data.map(...) */}
                  {news.data.map((n) => (
                    <div key={n.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                      {/* Header */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <p className="font-semibold text-base">{n.title}</p>
                        </div>

                        {getStatusBadge(n.status)}
                      </div>

                      {/* Detail */}
                      <div className="text-sm space-y-1">

                        <p>
                          <span className="font-medium">Tanggal Upload:</span> {formatDate(n.created)}
                        </p>

                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Link href={route('news.show', n)} className="btn btn-sm btn-outline "><Eye size={16} /></Link>

                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP VERSION (Table Mode) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="table table-zebra">

                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Judul</th>
                        <th>Tanggal Upload</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.data.map((n, index) => (
                        <tr key={n.id}>
                          <th>{n.id}</th>
                          <td>{n.title}</td>
                          <td>{formatDate(n.created)}</td>
                          <td>
                            {getStatusBadge(n.status)}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <Link href={route('news.show', n)} className="btn btn-sm btn-outline "><Eye size={16} /></Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

              </Card>
              {/* End Table */}

              {/* Start Pagination */}
              <PaginationDaisy data={news} />
              {/* End Pagination */}


            </div>


          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index