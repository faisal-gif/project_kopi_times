import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/Utils/formatter'
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Briefcase, Calendar, Clock, MapPin, Phone, User } from 'lucide-react';
import React from 'react'

function Show({ news }) {
    console.log(news);

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
            <Head title={news.title} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        

                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
                                        {news.title}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Dibuat: {formatDate(news.created)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Diperbarui: {formatDate(news.modified)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(news.status)}
                                    {/* {(article.status === "draft" || article.status === "rejected") && (
                                                <Button onClick={() => navigate(`/writer/write?edit=${article.id}`)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            )} */}
                                </div>
                            </div>
                        </div>

                        <Card title={"Gambar Artikel"} className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[news.image].map((image, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                            <img
                                                src={image ? `${image}` : '/placeholder.svg'}
                                                alt={news.title + ' Image ' + (index + 1)}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                {news.caption}
                            </p>
                        </Card>

                        <Card className="mb-6" title={"Narasumber "}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border bg-base-300/30">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-foreground font-medium">
                                            <User className="w-4 h-4 text-primary" />
                                            {news.narsum}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Briefcase className="w-4 h-4" />
                                            {news.profesi}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            {news.city}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="w-4 h-4" />
                                            {news.contact}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </Card>

                        <Card className="mb-6" title={"Isi Artikel"}>
                            <div className="prose max-w-none">
                                <div className='prose' dangerouslySetInnerHTML={{ __html: news.content }} />
                            </div>
                        </Card>

                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Show